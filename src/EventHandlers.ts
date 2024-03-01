import {
	TradePairContract_PositionOpened_loader,
	TradePairContract_PositionOpened_handler,
	TradePairContract_PositionClosed_loader,
	TradePairContract_PositionClosed_handler,
} from "../generated/src/Handlers.gen";

import { PositionEntity, UserEntity } from "../generated/src/Types.gen";

TradePairContract_PositionOpened_loader(({ event, context }) => {
	context.User.load(event.params.owner.toString());
	context.Position.load(event.params.id.toString(), {});
});

TradePairContract_PositionOpened_handler(({ event, context }) => {
	const user = context.User.get(event.params.owner.toString());

	if (user === undefined || user === null) {
		const userObject: UserEntity = {
			id: event.params.owner.toString(),
			address: event.params.owner.toString(),
		};

		context.User.set(userObject);
	}

	const position = context.Position.get(event.params.id.toString());

	// event PositionOpened(
	//     address indexed owner, uint256 id, int256 entryPrice, uint256 collateral, uint256 leverage, int8 direction
	// );

	if (position === undefined || position === null) {
		const positionObject: PositionEntity = {
			id: event.params.id.toString(),
			owner: event.params.owner.toString(),
			collateral: event.params.collateral,
			entryVolume: event.params.volume,
			entryTimestamp: BigInt(event.blockTimestamp),
			direction: event.params.direction,
			assets: event.params.assets,
			borrowFeeIntegral: event.params.borrowFeeIntegral,
			fundingFeeIntegral: event.params.fundingFeeIntegral,
			entryPrice: event.params.volume / event.params.assets,
			isOpen: true,
			closePrice: null,
			closeTimestamp: null,
			closeValue: null,
			pnl: null,
			borrowFeeAmount: null,
			fundingFeeAmount: null,
			totalPnL: null,
		};

		context.Position.set(positionObject);
	}
});

TradePairContract_PositionClosed_loader(({ event, context }) => {
	context.Position.load(event.params.id.toString(), {});
});

TradePairContract_PositionClosed_handler(({ event, context }) => {
	const position = context.Position.get(event.params.id.toString());

	if (position !== undefined && position !== null) {
		const totalPnL =
			position.direction * (event.params.value - position.entryVolume);
		const pnl =
			totalPnL + event.params.borrowFeeAmount + event.params.fundingFeeAmount;
		context.Position.set({
			...position,
			isOpen: false,
			closePrice: event.params.closePrice,
			closeTimestamp: BigInt(event.blockTimestamp),
			closeValue: event.params.value,
			pnl,
			borrowFeeAmount: event.params.borrowFeeAmount,
			fundingFeeAmount: event.params.fundingFeeAmount,
			totalPnL,
		});
	}
});
