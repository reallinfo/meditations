<p align="center"><img src="assets/horizontal.png" alt="meditations" height="80px"></p>

![CircleCI Badge](https://circleci.com/gh/ioddly/meditations.png?circle-token=:circle-token&style=shield)

meditations is an application for tracking progress towards goals that builds on habit formation and long term
thinking.

Originally a Trello board, meditations simply keeps track of how often you complete tasks, and how much time you spend
on them (optionally). It's fairly minimalist compared to more complex time management systems, and leave the structure
of your day entirely up to you. The goal of meditations is to get an objective, long-term view of how you are doing.

In addition, it has a note-taking application that supports tagging and organizing entries by named categories.

![sample usage video](http://i.imgur.com/gmFSRK4.gif)

## [> Live Demo <](https://meditations.upvalue.io)

# Manual

For information on how to use Meditations as well as some documentation of its architecture, see
[the documentation](https://ioddly.github.io/meditations). Also available in your local install
under the `docs` directory.

## Running from command line

    $ go get github.com/ioddly/meditations
    
Go to your workspace's source.

Make sure to use NPM instead of yarn due to the following issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18484#issuecomment-319968097

    $ go build
    $ npm i

Run the following command if you'd like to seed the application with some example data.

    $ ./meditations seed 2018-02-22 # put in today's date

    $ ./meditations serve --port 8080 --database sample.sqlite3 --migrate 

## Dependencies

- Go libraries: See Godeps/Godeps.json
- JS libraries: See package.json
- Programs: Pandoc (only necessary for exporting markdown/plaintext descriptions of progress)
- Browser: Meditations relies on modern browser features like `fetch,` and does not include polyfills. It is developed against the latest version of Chrome.

## Attribution

The favicon.ico was used under public domain from [Tango](http://tango.freedesktop.org)
