import assert from "assert";
import { MockDb, TradePair } from "../generated/src/TestHelpers.gen";
import { PositionEntity } from "../generated/src/Types.gen";
import { Addresses } from "../generated/src/bindings/Ethers.gen";

describe("Transfers", () => {
	it("PositionOped creates new Position and User entity ", () => {
		const mockDbEmpty = MockDb.createMockDb();

		const userAddress1 = Addresses.mockAddresses[0];

		const mockPositionEntity: PositionEntity = {
			id: "123",
			owner_id: userAddress1,
			collateral: 100_000n,
			entryVolume: 500_000n,
			assets: 500n,
			entryPrice: 1_000n,
			entryTimestamp: 2n,
			borrowFeeIntegral: 100n,
			fundingFeeIntegral: -200n,
			direction: 1n,
			isOpen: true,
			closePrice: undefined,
			closeTimestamp: undefined,
			closeValue: undefined,
			pnl: undefined,
			borrowFeeAmount: undefined,
			fundingFeeAmount: undefined,
			totalPnL: undefined,
		};

		const mockPositionOpened = TradePair.PositionOpened.createMockEvent({
			owner: userAddress1,
			id: 123n,
			entryPrice: 1_000n,
			collateral: 100_000n,
			volume: 500_000n,
			direction: 1n,
			assets: 500n,
			borrowFeeIntegral: 100n,
			fundingFeeIntegral: -200n,
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
      chainId: 31337,
		});

		const position1 = mockDbAfterPositionOpened.entities.Position.get("123");

		const user1 = mockDbAfterPositionOpened.entities.User.get(userAddress1);

		assert.deepEqual(position1, mockPositionEntity, "Should be equal");
		assert.equal(user1?.address, userAddress1, "user.address");
		assert.equal(user1?.id, userAddress1, "user.id");
	});

	it("PositionClosed updates position", () => {
		const mockDbEmpty = MockDb.createMockDb();

		const userAddress1 = Addresses.mockAddresses[0];

		const positionBefore: PositionEntity = {
			id: "123",
			owner_id: userAddress1,
			collateral: 100_000n,
			entryVolume: 500_000n,
			assets: 500n,
			entryPrice: 1_000n,
			entryTimestamp: 2n,
			borrowFeeIntegral: 100n,
			fundingFeeIntegral: -200n,
			direction: 1n,
			isOpen: true,
			closePrice: undefined,
			closeTimestamp: undefined,
			closeValue: undefined,
			pnl: undefined,
			borrowFeeAmount: undefined,
			fundingFeeAmount: undefined,
			totalPnL: undefined,
		};

		const updatedDb = mockDbEmpty.entities.Position.set(positionBefore);

		const mockPositionClosed = TradePair.PositionClosed.createMockEvent({
			owner: userAddress1,
			id: 123n,
			value: 590_000n,
			closePrice: 1_200n,
			borrowFeeAmount: 8_000n,
			fundingFeeAmount: 2_000n,
			mockEventData: {
				blockNumber: 1,
				blockTimestamp: 20,
				blockHash: "0x0",
				chainId: 1,
				srcAddress: userAddress1,
				transactionHash: "0x0",
				transactionIndex: 1,
				logIndex: 1,
			},
		});

		const mockDbAfterPositionClosed = TradePair.PositionClosed.processEvent({
			event: mockPositionClosed,
			mockDb: updatedDb,
      chainId: 31337,
		});

		const position1 = mockDbAfterPositionClosed.entities.Position.get("123");

		const expectedPosition: PositionEntity = {
			id: "123",
			owner_id: userAddress1,
			collateral: 100_000n,
			entryVolume: 500_000n,
			assets: 500n,
			entryPrice: 1_000n,
			entryTimestamp: 2n,
			borrowFeeIntegral: 100n,
			fundingFeeIntegral: -200n,
			direction: 1n,
			isOpen: false,
			closePrice: 1_200n,
			closeTimestamp: 20n,
			closeValue: 590_000n,
			pnl: 100_000n,
			borrowFeeAmount: 8_000n,
			fundingFeeAmount: 2_000n,
			totalPnL: 90_000n,
		};

		assert.deepEqual(position1, expectedPosition, "Should be equal");
	});
});
