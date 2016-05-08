test: basic basic_async none small_media large_media fragment recursion_not_allowed success_callback update_src lint

basic: server
	phantomjs basic.js $(test_port)

basic_async: server
	phantomjs basic-async.js $(test_port)

none: server
	phantomjs none.js $(test_port)

small_media: server
	phantomjs small_media.js $(test_port)

large_media: server
	phantomjs large_media.js $(test_port)

fragment: server
	phantomjs fragment.js $(test_port)

success_callback: server
	phantomjs success-callback.js $(test_port)

update_src: server
	phantomjs update-src.js $(test_port)

recursion_not_allowed: server
	phantomjs recursion-not-allowed.js $(test_port)

lint:
	jshint ../h-include.js

server:
	npm run server &
