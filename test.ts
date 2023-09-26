enum CardAttributes {
    Rank,
    Suit,
    Selected,
    Flipped
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    while (cardKit.getCursorCard() != cardKit.getContainerCardAtPosition(PlayerHand, CardContainerPositions.Last)) {
        cardKit.moveCardBetween(PlayerHand, CardContainerPositions.Last, DiscardPile, CardContainerPositions.Last)
    }
})

let CardStack = cardKit.createPlayingCards()
let PlayerHand = cardKit.createEmptyHand(0, 40, 60, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Center, true)
cardKit.setCardLayoutSpacing(PlayerHand, -14)
for(let i = 0; i < 10; i++) {
    cardKit.moveCardBetween(CardStack, CardContainerPositions.First, PlayerHand, CardContainerPositions.Last)
}
cardKit.setCursorAnchor(CardCursorAnchors.Center)
cardKit.moveCursorInsideLayoutWithButtons(PlayerHand)
let DiscardPile = cardKit.createEmptyHand(0, 120, 60, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Center, true)
cardKit.setCardLayoutSpacing(DiscardPile, -14)

