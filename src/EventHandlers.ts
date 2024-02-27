import {
	TradePairContract_PositionOpened_loader,
	TradePairContract_PositionOpened_handler,
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
			entryTimestamp: BigInt(event.blockTimestamp),
			direction: event.params.direction,
		};

		context.Position.set(positionObject);
	}
});
