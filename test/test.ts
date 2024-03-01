import assert from "assert";
import { MockDb, TradePair } from "../generated/src/TestHelpers.gen";
import { PositionEntity } from "../generated/src/Types.gen";
import { Addresses } from "../generated/src/bindings/Ethers.gen";

describe("Transfers", () => {
	it("PositionOped creates new Position entity ", () => {
		const mockDbEmpty = MockDb.createMockDb();

		const userAddress1 = Addresses.mockAddresses[0];

		const mockPositionEntity: PositionEntity = {
			id: 123,
			owner: userAddress1,
			collateral: 100_000n,
			entryTimestamp: 2n,
			direction: 1,
		};

		const mockPositionOpened = TradePair.PositionOpened.createMockEvent({
			owner: userAddress1,
			id: 123,
			entryPrice: 1_000n,
			collateral: 100_000n,
			leverage: 1n,
			direction: 1,
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

		const position1 = mockDbAfterPositionOpened.entities.Position.get(123);

		assert.deepEqual(position1, mockPositionEntity, "Should be equal");
	});
});
