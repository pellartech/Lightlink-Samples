test_single_file:
	npx hardhat test ./test/${NAME}.test.ts

deploy:
	npx hardhat run --network ${NETWORK} scripts/deploy/deploy.js

verify:
	npx hardhat verify --network ${NETWORK} ${ADDRESS}
