// enum CardAttributes {
//     Rank,
//     Suit,
//     SuitColor
// }
// enum CardContainerKinds {
//     Draw,
//     Discard,
//     Player,
//     Puzzle,
//     Score,
//     Tableau
// }
// enum DesignTemplates {
//     PlayingCards
// }

// function checkWinCondition () {
//     scoredCardCount = 0
//     for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
//         scoredCardCount += cardKit.getContainerCardCount(scoringPile)
//     }
//     if (scoredCardCount > 1) {
//         cardKit.disableLayoutButtonControl()
//         pause(1000)
//         isWinning = true
//     }
// }
// function returnPickedUpCards () {
//     while (hasPickedUpCards()) {
//         cardKit.moveCardBetween(pickedUpCards, CardContainerPositions.First, pickUpSourceContainer, CardContainerPositions.Last, CardFaces.Unchanged)
//     }
//     pickUpSourceContainer = pickedUpCards
// }
// cardKit.createSelectEvent(CardContainerKinds.Tableau, SelectionButtons.A, function (container, card) {
//     if (hasPickedUpCards()) {
//         if (pickUpSourceContainer == container && cardKit.getContainerCardCount(pickedUpCards) == 1) {
//             tryScoreSingleCard()
//         } else if (cardKit.getCardNumberAttribute(cardKit.getCard(container, CardContainerPositions.Last), CardAttributes.Rank) == cardKit.getCardNumberAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.Rank) + 1) {
//             if (cardKit.getCardNumberAttribute(cardKit.getCard(container, CardContainerPositions.Last), CardAttributes.SuitColor) != cardKit.getCardNumberAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.SuitColor)) {
//                 while (hasPickedUpCards()) {
//                     cardKit.moveCardBetween(pickedUpCards, CardContainerPositions.First, container, CardContainerPositions.Last, CardFaces.Unchanged)
//                 }
//             }
//         }
//         returnPickedUpCards()
//     } else {
//         if (cardKit.getCardFaceUp(card)) {
//             pickUpSourceContainer = container
//             while (card != cardKit.getCard(container, CardContainerPositions.Last)) {
//                 cardKit.moveCardBetween(container, CardContainerPositions.Last, pickedUpCards, CardContainerPositions.First, CardFaces.Unchanged)
//             }
//             cardKit.addCardTo(pickedUpCards, card, CardContainerPositions.First, CardFaces.Unchanged)
//         } else if (card == cardKit.getCard(container, CardContainerPositions.Last)) {
//             cardKit.setCardFaceUp(cardKit.getCard(container, CardContainerPositions.Last), true)
//         }
//     }
// })
// cardKit.createSelectEmptySlotEvent(CardContainerKinds.Tableau, SelectionButtons.A, function (container) {
//     if (pickUpSourceContainer == container && cardKit.getContainerCardCount(pickedUpCards) == 1) {
//         tryScoreSingleCard()
//     } else if (hasPickedUpCards() && cardKit.getCardNumberAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.Rank) == 13) {
//         while (hasPickedUpCards()) {
//             cardKit.moveCardBetween(pickedUpCards, CardContainerPositions.First, container, CardContainerPositions.Last, CardFaces.Unchanged)
//         }
//     }
//     returnPickedUpCards()
// })
// cardKit.createSelectEvent(CardContainerKinds.Score, SelectionButtons.A, function (container, card) {
//     if (hasPickedUpCards()) {
//         returnPickedUpCards()
//     } else {
//         pickUpSourceContainer = container
//         cardKit.moveCardBetween(container, CardContainerPositions.First, pickedUpCards, CardContainerPositions.Last, CardFaces.Unchanged)
//     }
// })
// function setupGame () {
//     pickedUpCards = cardKit.createEmptyHand(DesignTemplates.PlayingCards, CardContainerKinds.Player, CardLayoutDirections.TopToBottom)
//     cardKit.setCardLayoutSpacing(pickedUpCards, -14)
//     cardKit.setContainerLayer(pickedUpCards, 500)
//     cardKit.hideEmptySlots(pickedUpCards)
//     drawDeck = cardKit.createPlayingCards()
//     cardKit.setContainerPosition(drawDeck, 20, 36)
//     discardPile = cardKit.createEmptyPile(DesignTemplates.PlayingCards, CardContainerKinds.Discard)
//     cardKit.setContainerPosition(discardPile, 34, 36)
//     cardKit.linkContainers(discardPile, RelativeDirections.RightOf, drawDeck)
//     previousContainer = discardPile
//     for (let index = 0; index <= 6; index++) {
//         tableauStack = cardKit.createEmptyHand(DesignTemplates.PlayingCards, CardContainerKinds.Tableau, CardLayoutDirections.TopToBottom)
//         cardKit.setCardLayoutSpacing(tableauStack, -14)
//         cardKit.setContainerPosition(tableauStack, 55 + 14 * index, 36)
//         cardKit.linkContainers(tableauStack, RelativeDirections.RightOf, previousContainer)
//         cardKit.setContainerEntryPoint(tableauStack, CardContainerPositions.Last)
//         previousContainer = tableauStack
//     }
//     for (let index = 0; index <= 3; index++) {
//         scoringPile = cardKit.createEmptyPile(DesignTemplates.PlayingCards, CardContainerKinds.Score)
//         cardKit.setContainerPosition(scoringPile, 55 + 14 * index, 14)
//         cardKit.linkContainers(scoringPile, RelativeDirections.RightOf, previousContainer)
//         previousContainer = scoringPile
//         cardKit.linkContainers(cardKit.getContainerKindList(CardContainerKinds.Tableau)[index], RelativeDirections.Below, scoringPile)
//     }
// }
// cardKit.createSelectEmptySlotEvent(CardContainerKinds.Discard, SelectionButtons.A, function (container) {
//     tryScoreSingleCard()
//     returnPickedUpCards()
// })
// function hasPickedUpCards () {
//     return cardKit.getContainerCardCount(pickedUpCards) > 0
// }
// function tryScoreSingleCard () {
//     if (cardKit.getContainerCardCount(pickedUpCards) == 1) {
//         for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
//             if (cardKit.getContainerCardCount(scoringPile) == 0) {
//                 if (cardKit.getCardNumberAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.Rank) == 1) {
//                     cardKit.moveCardBetween(pickedUpCards, CardContainerPositions.First, scoringPile, CardContainerPositions.First, CardFaces.Unchanged)
//                     checkWinCondition()
//                 }
//             } else if (cardKit.getCardNumberAttribute(cardKit.getCard(scoringPile, CardContainerPositions.First), CardAttributes.Rank) + 1 == cardKit.getCardNumberAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.Rank)) {
//                 if (cardKit.getCardTextAttribute(cardKit.getCard(scoringPile, CardContainerPositions.First), CardAttributes.Suit) == cardKit.getCardTextAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.Suit)) {
//                     cardKit.moveCardBetween(pickedUpCards, CardContainerPositions.First, scoringPile, CardContainerPositions.First, CardFaces.Unchanged)
//                     checkWinCondition()
//                 }
//             }
//         }
//     }
// }
// cardKit.createSelectEvent(CardContainerKinds.Discard, SelectionButtons.A, function (container, card) {
//     if (hasPickedUpCards()) {
//         if (pickUpSourceContainer == container) {
//             tryScoreSingleCard()
//         }
//         returnPickedUpCards()
//     } else {
//         pickUpSourceContainer = container
//         cardKit.moveCardBetween(container, CardContainerPositions.First, pickedUpCards, CardContainerPositions.Last, CardFaces.Unchanged)
//     }
// })
// cardKit.createSelectEmptySlotEvent(CardContainerKinds.Score, SelectionButtons.A, function (container) {
//     if (cardKit.getContainerCardCount(pickedUpCards) == 1) {
//         if (cardKit.getCardNumberAttribute(cardKit.getCard(pickedUpCards, CardContainerPositions.First), CardAttributes.Rank) == 1) {
//             cardKit.moveCardBetween(pickedUpCards, CardContainerPositions.First, container, CardContainerPositions.First, CardFaces.Unchanged)
//             checkWinCondition()
//         }
//     }
//     returnPickedUpCards()
// })
// cardKit.createSelectEvent(CardContainerKinds.Draw, SelectionButtons.A, function (container, card) {
//     if (hasPickedUpCards()) {
//         returnPickedUpCards()
//     } else {
//         cardKit.moveCardBetween(container, CardContainerPositions.First, discardPile, CardContainerPositions.First, CardFaces.Up)
//     }
// })
// cardKit.createSelectEmptySlotEvent(CardContainerKinds.Draw, SelectionButtons.A, function (container) {
//     if (hasPickedUpCards()) {
//         returnPickedUpCards()
//     } else {
//         // Reform the draw pile by placing the top card of the discard file back to the top of the draw pile, face down, and repeat until the discard pile is empty
//         while (cardKit.getContainerCardCount(discardPile) > 0) {
//             cardKit.moveCardBetween(discardPile, CardContainerPositions.First, container, CardContainerPositions.First, CardFaces.Down)
//         }
//     }
// })
// function setupTableau () {
//     cardKit.shuffleCards(drawDeck)
//     for (let index = 0; index <= 6; index++) {
//         tableauStack = cardKit.getContainerKindList(CardContainerKinds.Tableau)[index]
//         for (let index2 = 0; index2 < index + 0; index2++) {
//             cardKit.moveCardBetween(drawDeck, CardContainerPositions.First, tableauStack, CardContainerPositions.Last, CardFaces.Up)
//             pause(50)
//         }
//         if (index > 0) {
//             cardKit.setCardFaceUp(cardKit.getCard(tableauStack, CardContainerPositions.Last), true)
//         }
//     }
// }
// let thrownCard: cardCore.Card = null
// let scoringPile: cardCore.CardContainer = null
// let tableauStack: cardCore.CardContainer = null
// let previousContainer: cardCore.CardContainer = null
// let discardPile: cardCore.CardContainer = null
// let drawDeck: cardCore.CardContainer = null
// let pickUpSourceContainer: cardCore.CardContainer = null
// let pickedUpCards: cardCore.CardContainer = null
// let scoredCardCount = 0
// let isWinning = false
// isWinning = false
// scene.setBackgroundImage(assets.image`background`)
// setupGame()
// setupTableau()
// cardKit.moveCursorInsideLayoutWithButtons(drawDeck)

// // Destroy all cards and containers test
// cardKit.destroyCardLayoutCards(drawDeck)
// cardKit.destroyCardLayoutCards(discardPile)
// cardKit.destroyCardLayoutCards(pickedUpCards)
// for (let tableauStack2 of cardKit.getContainerKindList(CardContainerKinds.Tableau)) {
//     cardKit.destroyCardLayoutCards(tableauStack2)
// }
// for (let scoringPile2 of cardKit.getContainerKindList(CardContainerKinds.Score)) {
//     cardKit.destroyCardLayoutCards(scoringPile2)
// }

// // This is a workaround for having a card stack follow a sprite without being able to use sprite follow.
// game.onUpdate(function () {
//     cardKit.setContainerPosition(pickedUpCards, cardKit.getCursorSprite().x - 4, cardKit.getCursorSprite().y + 2)
//     if (hasPickedUpCards()) {
//         cardKit.setCursorAnchor(AnchorPositions.TopRight, -2, 18)
//     } else {
//         cardKit.setCursorAnchor(AnchorPositions.TopRight, -2, 8)
//     }
// })
// game.onUpdateInterval(1000, function () {
//     if (isWinning) {
//         scoredCardCount = 0
//         for (let scoringPile of cardKit.getContainerKindList(CardContainerKinds.Score)) {
//             scoredCardCount += cardKit.getContainerCardCount(scoringPile)
//             if (cardKit.getContainerCardCount(scoringPile) > 0) {
//                 thrownCard = cardKit.removeCardFrom(scoringPile, CardContainerPositions.First)
//                 thrownCard.setVelocity(randint(-80, 80), randint(-10, -20))
//                 thrownCard.ay = 300
//                 thrownCard.z = 200
//                 thrownCard.setFlag(SpriteFlag.AutoDestroy, true)
//             }
//         }
//         if (scoredCardCount == 0) {
//             game.setGameOverEffect(true, effects.bubbles)
//             game.gameOver(true)
//         }
//     }
// })
