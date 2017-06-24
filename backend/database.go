package backend

// database.go - Database open, close and migration

import (
	"github.com/jinzhu/gorm"
	_ "github.com/mattn/go-sqlite3" // load sqlite3 driver
)

// DB global database handle
var DB *gorm.DB

// DBOpen open database
func DBOpen() {
	db, err := gorm.Open("sqlite3", Config.DBPath)
	checkErr(err)
	DB = db
	DB.LogMode(Config.DBLog)
}

// DBMigrate run database migration
func DBMigrate() {
	// habits.go
	DB.Exec("pragma foreign_keys = on;")
	DB.AutoMigrate(
		// app.go
		&Settings{},
		// habits.go
		&Task{}, &Comment{}, &Scope{},
		// journal.go
		&Entry{}, &Tag{},
	)
	DBCreate()

	// By hand migrations
	settings := Settings{Name: "settings"}
	DB.First(&settings)
}

// DBCreate initialize a new database; will not overwrite existing settings.
func DBCreate() {
	day, month, year, bucket := Scope{Name: "Day"}, Scope{Name: "Month"}, Scope{Name: "Year"}, Scope{Name: "Bucket"}

	// lazily create scopes
	DB.FirstOrCreate(&day)
	DB.FirstOrCreate(&month)
	DB.FirstOrCreate(&year)
	DB.FirstOrCreate(&bucket)

	settings := Settings{Name: "settings", Schema: 1}

	DB.FirstOrCreate(&settings)
}

// DBSeed seeds the database with example data, suitable for testing or the demo application
func DBSeed() {

}

// DBClose close database handle
func DBClose() {
	DB.Close()
}

// DBRepair fix potential inconsistencies such as tags pointing to dead entries, out-of-order tasks etc
func DBRepair() {

}
