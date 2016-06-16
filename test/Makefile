RUNNER = node
PORT = 8080

default: all

all: test lint

test: server
	PORT=${PORT} ${RUNNER} index.js ${TEST}

lint:
	jshint ../h-include.js

server:
	npm run server &
