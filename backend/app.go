// Package backend contains the backend code for meditations
package backend

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/codegangsta/cli"
	"github.com/go-macaron/pongo2"
	"github.com/tylerb/graceful"
	"gopkg.in/macaron.v1"
)

// Configuration variables
type Configuration struct {
	// HTTP host
	Host string
	// HTTP port
	Port int
	// Database path
	DBPath string
	// If true, all SQL queries will be logged
	DBLog bool
	// Site title
	SiteTitle string
	// True if running in development mode
	Development bool
	// If true, show tutorial
	Tutorial bool
	// If true, run a database migration before starting
	Migrate bool
	// Message to be displayed in navbar, used in the demo site
	Message string
}

// Config is the global application configuration
var Config = Configuration{
	Host:        "",
	Port:        8080,
	DBPath:      "development.sqlite3",
	DBLog:       false,
	SiteTitle:   "meditations",
	Development: true,
	Tutorial:    false,
	Migrate:     false,
	Message:     "",
}

func loadConfig(c *cli.Context) {
	Config.DBLog = c.Bool("db-log")
	Config.Development = c.BoolT("development")
	Config.DBPath = c.String("database")
	Config.Port = c.Int("port")
	Config.Tutorial = c.Bool("tutorial")
	Config.Migrate = c.Bool("migrate")
	Config.Message = c.String("message")
}

// App configures returns a meditations web application
func App() *macaron.Macaron {
	_, err := os.Stat("./assets/webpack/bundle-habits.js")
	if os.IsNotExist(err) {
		panic("./assets/webpack/bundle-habits.js not found; did you run webpack")
	}

	m := macaron.Classic()

	DBOpen()
	if Config.Migrate == true {
		DBMigrate()
	}

	if Config.Development == true {
		macaron.Env = "development"
	} else {
		macaron.Env = "production"
	}

	m.Use(pongo2.Pongoer(pongo2.Options{
		Directory:  "templates",
		Extensions: []string{".htm"},
	}))

	// Serve static files from /assets
	m.Use(macaron.Static("assets", macaron.StaticOptions{Prefix: "assets"}))

	// Expose configuration variables to templates & javascript
	cfgjsonc, err := json.Marshal(Config)
	cfgjson := fmt.Sprintf("%s", cfgjsonc)
	if err != nil {
		panic(err)
	}

	m.Use(func(c *macaron.Context) {
		c.Data["ConfigJSON"] = cfgjson
		c.Data["Config"] = Config
		c.Next()
	})

	// Routes
	m.Get("/favicon.ico", func(c *macaron.Context) {
		c.ServeFileContent("favicon.ico")
	})

	m.Get("/", func(c *macaron.Context) {
		c.Redirect("/habits")
	})

	init := func(x string, r func(m *macaron.Macaron)) { m.Group(x, func() { r(m) }) }

	init("/habits", habitsInit)
	init("/journal", journalInit)

	return m
}

// Server returns a server that closes gracefully
func Server() *graceful.Server {
	server := &graceful.Server{
		Timeout: 10 * time.Second,
		Server: &http.Server{
			Addr:    fmt.Sprintf("%s:%v", Config.Host, Config.Port),
			Handler: App(),
		},
	}

	server.BeforeShutdown = func() bool {
		log.Printf("closing database")
		DBClose()
		log.Printf("shutting down server")
		return true
	}

	return server
}

// Main is the entry point for meditations; it handles CLI options and starts
func Main() {
	app := cli.NewApp()
	app.Name = "meditations"

	flags := []cli.Flag{
		cli.BoolFlag{
			Name:  "db-log",
			Usage: "verbosely log SQL",
		},
		cli.StringFlag{
			Name:  "database",
			Usage: "database",
			Value: "development.sqlite3",
		},
		cli.StringFlag{
			Name:  "message",
			Usage: "A message that will be displayed at the top, used for demo deployment",
		},
		cli.BoolTFlag{
			Name:  "development",
			Usage: "whether development is true",
		},
		cli.BoolFlag{
			Name:  "tutorial",
			Usage: "enable tutorial",
		},
		cli.IntFlag{
			Name:  "port",
			Usage: "HTTP port",
			Value: 8080,
		},
		cli.BoolFlag{
			Name:  "migrate",
			Usage: "run database migration",
		},
	}

	app.Commands = []cli.Command{
		{
			Name:   "repair",
			Usage:  "repair out-of-order tasks in database",
			Flags:  flags,
			Action: func(c *cli.Context) { DBRepair() },
		},
		{
			Name:  "migrate",
			Usage: "migrate database",
			Flags: flags,
			Action: func(c *cli.Context) {
				loadConfig(c)
				Config.DBLog = true
				fmt.Printf("%v\n", Config)
				DBOpen()
				DBMigrate()
				DBClose()
			},
		},
		{
			Name:  "serve",
			Usage: "start server",
			Flags: flags,
			Action: func(c *cli.Context) {
				loadConfig(c)
				log.Printf("running with configuration %+v\n", Config)
				log.Printf("starting server")
				server := Server()
				err := server.ListenAndServe()
				log.Printf("%v", err)
			},
		},
	}

	app.Run(os.Args)
}
