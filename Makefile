all: install test

test: 10. 12. 13.

install:
	npm install

prepublish:
	npm run all

%:
	n $@
	npm test
	#npm run coverage

.PHONY: all prepublish test install
