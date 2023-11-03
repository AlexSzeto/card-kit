enum CardContainerKinds {
    Draw,
    Discard,
    Player,
    Puzzle,
    Score,
    Tableau
}
let previousContainer: cardCore.CardContainer = null
let tableauStack: cardCore.CardContainer = null
let scoringPile: cardCore.CardContainer = null
let drawDeck = cardKit.createPlayingCards()
cardKit.setContainerPosition(drawDeck, 20, 36)
let discardPile = cardKit.createEmptyPile(CardContainerKinds.Discard)
cardKit.setContainerPosition(discardPile, 34, 36)
cardKit.linkContainers(discardPile, RelativeDirections.RightOf, drawDeck)
previousContainer = discardPile
let tableaus = []
for (let index = 0; index <= 6; index++) {
    tableauStack = cardKit.createEmptyHand(CardContainerKinds.Tableau, CardLayoutDirections.TopToBottom)
    cardKit.setCardLayoutSpacing(tableauStack, -12)
    cardKit.setContainerPosition(tableauStack, 55 + 14 * index, 36)
    for (let index2 = 0; index2 < index + 0; index2++) {
        cardKit.moveCardBetween(drawDeck, CardContainerPositions.First, tableauStack, CardContainerPositions.Last, CardFaces.Up)
    }
    cardKit.linkContainers(tableauStack, RelativeDirections.RightOf, previousContainer)
    cardKit.setContainerEntryPoint(tableauStack, CardContainerPositions.Last)
    previousContainer = tableauStack
    tableaus.push(tableauStack)
}
for (let index = 0; index <= 3; index++) {
    scoringPile = cardKit.createEmptyPile(CardContainerKinds.Score)
    cardKit.setContainerPosition(scoringPile, 55 + 14 * index, 14)
    cardKit.linkContainers(scoringPile, RelativeDirections.RightOf, previousContainer)
    previousContainer = scoringPile
    cardKit.linkContainers(tableaus[index], RelativeDirections.Below, scoringPile)
}

cardCursor.select(drawDeck)
cardCursor.setAnchor(CardCursorAnchors.TopRight, -2, 8)

for (let index = 0; index <= 13; index++) {
    cardKit.moveCardBetween(drawDeck, CardContainerPositions.First, scoringPile, CardContainerPositions.Last, CardFaces.Up)

}