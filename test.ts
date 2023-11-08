enum CardAttributes {
    Rank,
    Suit,
    SuitColor
}
enum CardContainerKinds {
    Draw,
    Discard,
    Player,
    Puzzle,
    Score,
    Tableau
}
function setupGame () {
    let tableaus: cardCore.CardContainer[] = []
    drawDeck = cardKit.createPlayingCards()
    cardKit.setContainerPosition(drawDeck, 20, 36)
    discardPile = cardKit.createEmptyPile(CardContainerKinds.Discard)
    cardKit.setContainerPosition(discardPile, 34, 36)
    cardKit.linkContainers(discardPile, RelativeDirections.RightOf, drawDeck)
    previousContainer = discardPile
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
    cardKit.moveCursorInsideLayoutWithButtons(drawDeck)
    cardKit.setCursorAnchor(CardCursorAnchors.TopRight, -2, 8)
}
cardKit.createSelectEvent(CardContainerKinds.Draw, function (container, card) {
    if (cardKit.getContainerCardCount(container) == 0) {
    	
    } else {
        cardKit.moveCardBetween(container, CardContainerPositions.First, discardPile, CardContainerPositions.First, CardFaces.Up)
    }
})
let scoringPile: cardCore.CardContainer = null
let tableauStack: cardCore.CardContainer = null
let previousContainer: cardCore.CardContainer = null
let discardPile: cardCore.CardContainer = null
let drawDeck: cardCore.CardContainer = null
setupGame()
