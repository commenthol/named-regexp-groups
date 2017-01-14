all: install test

test: 0.8 0.10 0.12 4. 6. 7.

install:
	rm -rf ./node_modules
	npm install --verbose

prepublish:
	rm -rf ./lib \
	&& npm run __prepublish \
	&& npm pack

%:
	n $@
	# npm test
	npm run coverage

.PHONY: all prepublish test install
