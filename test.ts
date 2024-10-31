// enum CardAttributes {
//   Rank,
//   Suit,
//   Selected,
//   Flipped,
//   SuitColor
// }
// enum CardContainerKinds {
//   Draw,
//   Discard,
//   Hand,
//   Grid,
//   Player,
//   Puzzle
// }
// cardKit.createSelectEvent(CardContainerKinds.Grid, SelectionButtons.A, function (container, card) {
//   if (!(cardKit.getCardFaceUp(card))) {
//       cardKit.flipCard(card)
//       flipCount += 1
//       if (flipCount == 1) {
//           firstCard = card
//       } else {
//           secondCard = card
//       }
//   }
//   if (flipCount == 2) {
//       pause(500)
//       if (cardKit.getCardNumberAttribute(firstCard, CardAttributes.Rank) == cardKit.getCardNumberAttribute(secondCard, CardAttributes.Rank)) {
//           cardKit.addCardTo(discardPile, firstCard, CardContainerPositions.First, CardFaces.Unchanged)
//           cardKit.addCardTo(discardPile, secondCard, CardContainerPositions.First, CardFaces.Unchanged)
//           if (cardKit.getContainerCardCount(container) == 0) {
//               pause(1000)
//               game.setGameOverEffect(true, effects.blizzard)
//               game.gameOver(true)
//           }
//       } else {
//           info.changeLifeBy(-1)
//           cardKit.flipCard(firstCard)
//           cardKit.flipCard(secondCard)
//       }
//       flipCount = 0
//   }
// })
// function SetupPlayField () {
//   cardDeck.setPosition(20, 60)
//   playGrid = cardKit.createEmptyGrid(0, CardContainerKinds.Grid, 3, 6)
//   discardPile = cardKit.createEmptyPile(0, CardContainerKinds.Draw)
//   cardKit.setContainerPosition(discardPile, 140, 60)
//   cardKit.lockGridCardPositions(playGrid, 0)

//   while (cardKit.containerHasCards(cardDeck)) {
//       cardKit.moveCardBetween(cardDeck, CardContainerPositions.First, playGrid, CardContainerPositions.Last, CardFaces.Unchanged)
//       pause(200)
//   }
//   deleteCardsList = cardKit.getLayoutCardListCopy(playGrid)
//   let count = 0
//   for (let card of deleteCardsList) {
//     if (count < 8) {
//       cardKit.addCardTo(discardPile, card, CardContainerPositions.Last, CardFaces.Unchanged)
// count++      
//     }
//   }
//     info.setLife(16)
//   cardKit.moveCursorInsideLayoutWithButtons(playGrid)
// }
// function SetupDeck () {
//   cardDeck = cardKit.createPlayingCards()
//   deleteCardsList = cardKit.getLayoutCardListCopy(cardDeck)
//   for (let card of deleteCardsList) {
//       if (cardKit.getCardNumberAttribute(card, CardAttributes.Rank) > 9) {
//           sprites.destroy(card)
//       } else if (cardKit.getCardTextAttribute(card, CardAttributes.Suit) == "clubs") {
//           sprites.destroy(card)
//       } else if (cardKit.getCardTextAttribute(card, CardAttributes.Suit) == "diamonds") {
//           sprites.destroy(card)
//       }
//   }
//   cardKit.shuffleCards(cardDeck)
// }
// let deleteCardsList: cardCore.Card[] = []
// let playGrid: cardCore.CardContainer = null
// let cardDeck: cardCore.CardContainer = null
// let discardPile: cardCore.CardContainer = null
// let secondCard: cardCore.Card = null
// let firstCard: cardCore.Card = null
// let flipCount = 0

// SetupDeck()
// SetupPlayField()
// cardKit.hideEmptySlots(playGrid)
// pause(500)
// cardKit.destroyCardLayoutCards(cardDeck)
// cardKit.destroyCardLayoutCards(playGrid)
// cardKit.destroyCardLayoutCards(discardPile)