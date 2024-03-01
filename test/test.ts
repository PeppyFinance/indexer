import assert from "assert";
import { MockDb, TradePair } from "../generated/src/TestHelpers.gen";
import { PositionEntity } from "../generated/src/Types.gen";
import { Addresses } from "../generated/src/bindings/Ethers.gen";

describe("Transfers", () => {
	it("PositionOped creates new Position entity ", () => {
		const mockDbEmpty = MockDb.createMockDb();

		const userAddress1 = Addresses.mockAddresses[0];

		const mockPositionEntity: PositionEntity = {
			id: "123",
			owner: userAddress1,
			collateral: 100_000n,
			entryTimestamp: 2n,
			direction: 1n,
		};

		const mockPositionOpened = TradePair.PositionOpened.createMockEvent({
			owner: userAddress1,
			id: 123n,
			entryPrice: 1_000n,
			collateral: 100_000n,
			volume: 500_000n,
			direction: 1n,
			mockEventData: {
				blockNumber: 1,
				blockTimestamp: 2,
				blockHash: "0x0",
				chainId: 1,
				srcAddress: userAddress1,
				transactionHash: "0x0",
				transactionIndex: 1,
				logIndex: 1,
			},
		});

		const mockDbAfterPositionOpened = TradePair.PositionOpened.processEvent({
			event: mockPositionOpened,
			mockDb: mockDbEmpty,
		});

		const position1 = mockDbAfterPositionOpened.entities.Position.get("123");

		const user1 = mockDbAfterPositionOpened.entities.User.get(userAddress1);

		assert.deepEqual(position1, mockPositionEntity, "Should be equal");
		assert.equal(user1?.address, userAddress1, "user.address");
		assert.equal(user1?.id, userAddress1, "user.id");
	});
});
