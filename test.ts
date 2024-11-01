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

// cardKit.createSelectEvent(CardContainerKinds.Draw, SelectionButtons.A, function (container, card) {
//   cardKit.moveCardBetween(playGrid, CardContainerPositions.Random, cardDeck, CardContainerPositions.Last, CardFaces.Unchanged)
// })

// cardKit.createSelectEvent(CardContainerKinds.Discard, SelectionButtons.A, function (container, card) {
//   cardKit.moveCardBetween(discardPile, CardContainerPositions.First, playGrid, CardContainerPositions.Random, CardFaces.Unchanged)
// })

// cardKit.createSelectEvent(CardContainerKinds.Grid, SelectionButtons.A, function (container, card) {
//   cardKit.addCardTo(discardPile, card, CardContainerPositions.First, CardFaces.Unchanged)
// })
// function SetupPlayField () {
//   cardDeck.setPosition(20, 60)
//   playGrid = cardKit.createEmptyGrid(0, CardContainerKinds.Grid, 3, 6)
//   discardPile = cardKit.createEmptyPile(0, CardContainerKinds.Discard)
//   cardKit.setContainerPosition(discardPile, 140, 60)
//   cardKit.lockGridCardPositions(playGrid, 0)

//   for(let i = 0; i < 8; i++) {
//     cardKit.moveCardBetween(cardDeck, CardContainerPositions.First, playGrid, CardContainerPositions.Last, CardFaces.Up)
//   }
//   deleteCardsList = cardKit.getLayoutCardListCopy(playGrid)
//   let count = 0
//   for (let card of deleteCardsList) {
//     if (count < 4) {
//       cardKit.moveCardBetween(playGrid, CardContainerPositions.Last, discardPile, CardContainerPositions.Last, CardFaces.Up)
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

// cardKit.linkContainers(playGrid, RelativeDirections.RightOf, cardDeck)
// cardKit.linkContainers(playGrid, RelativeDirections.LeftOf, discardPile)

// // cardKit.hideEmptySlots(playGrid)
// pause(500)
// cardKit.destroyCardLayoutCards(cardDeck)
// pause(500)
// cardKit.destroyCardLayoutCards(playGrid)
// pause(500)
// cardKit.destroyCardLayoutCards(discardPile)