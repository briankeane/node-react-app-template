docker-test-all:
	touch services/server/.env; \
	docker-compose run server yarn test; \
	docker-compose run server yarn lint; \
	docker-compose run website yarn lint;