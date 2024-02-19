import {
  ERC20Contract_Approval_loader,
  ERC20Contract_Approval_handler,
  ERC20Contract_Transfer_loader,
  ERC20Contract_Transfer_handler,
  TradePairContract_PositionOpened_loader,
  TradePairContract_PositionOpened_handler,
} from "../generated/src/Handlers.gen";

import {
  AccountEntity,
  ApprovalEntity,
  PositionEntity,
  UserEntity,
} from "../generated/src/Types.gen";

ERC20Contract_Approval_loader(({ event, context }) => {
  // loading the required Account entity
  context.Account.load(event.params.owner.toString());
});

ERC20Contract_Approval_handler(({ event, context }) => {
  //  getting the owner Account entity
  let ownerAccount = context.Account.get(event.params.owner.toString());

  if (ownerAccount === undefined) {
    // Usually an accoun that is being approved alreay has/has had a balance, but it is possible they havent.

    // create the account
    let accountObject: AccountEntity = {
      id: event.params.owner.toString(),
      balance: 0n,
    };
    context.Account.set(accountObject);
  }

  let approvalId =
    event.params.owner.toString() + "-" + event.params.spender.toString();

  let approvalObject: ApprovalEntity = {
    id: approvalId,
    amount: event.params.value,
    owner: event.params.owner.toString(),
    spender: event.params.spender.toString(),
  };

  // this is the same for create or update as the amount is overwritten
  context.Approval.set(approvalObject);
});

ERC20Contract_Transfer_loader(({ event, context }) => {
  context.Account.load(event.params.from.toString());
  context.Account.load(event.params.to.toString());
});

ERC20Contract_Transfer_handler(({ event, context }) => {
  let senderAccount = context.Account.get(event.params.from.toString());

  if (senderAccount === undefined || senderAccount === null) {
    // create the account
    // This is likely only ever going to be the zero address in the case of the first mint
    let accountObject: AccountEntity = {
      id: event.params.from.toString(),
      balance: 0n - event.params.value,
    };

    context.Account.set(accountObject);
  } else {
    // subtract the balance from the existing users balance
    let accountObject: AccountEntity = {
      id: senderAccount.id,
      balance: senderAccount.balance - event.params.value,
    };
    context.Account.set(accountObject);
  }

  let receiverAccount = context.Account.get(event.params.to.toString());

  if (receiverAccount === undefined || receiverAccount === null) {
    // create new account
    let accountObject: AccountEntity = {
      id: event.params.to.toString(),
      balance: event.params.value,
    };
    context.Account.set(accountObject);
  } else {
    // update existing account
    let accountObject: AccountEntity = {
      id: receiverAccount.id,
      balance: receiverAccount.balance + event.params.value,
    };

    context.Account.set(accountObject);
  }
});

TradePairContract_PositionOpened_loader(({ event, context }) => {
  context.User.load(event.params.owner.toString());
  context.Position.load(event.params.id.toString(), {});
});

TradePairContract_PositionOpened_handler(({ event, context }) => {
  let user = context.User.get(event.params.owner.toString());

  if (user === undefined || user === null) {
    let userObject: UserEntity = {
      id: event.params.owner.toString(),
      address: event.params.owner.toString(),
    };

    context.User.set(userObject);
  }

  let position = context.Position.get(event.params.id.toString());

  // event PositionOpened(
  //     address indexed owner, uint256 id, int256 entryPrice, uint256 collateral, uint256 leverage, int8 direction
  // );

  if (position === undefined || position === null) {
    let positionObject: PositionEntity = {
      id: event.params.id.toString(),
      owner: event.params.owner.toString(),
      collateral: event.params.collateral,
      entryTimestamp: BigInt(event.blockTimestamp),
      direction: event.params.direction,
    };

    context.Position.set(positionObject);
  }
});
