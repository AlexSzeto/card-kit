enum CardAttributes {
    Rank,
    Suit,
    Selected,
    Flipped
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    while (cardKit.getCursorCard() != cardKit.getContainerCardAtPosition(PlayerHand, CardContainerPositions.Last)) {
        cardKit.moveCardBetween(PlayerHand, CardContainerPositions.Last, DiscardPile, CardContainerPositions.Last, CardFacingModifiers.Unchanged)
    }
})

let CardStack = cardKit.createPlayingCards()
let PlayerHand = cardKit.createEmptyHand(0, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Center)
PlayerHand.setPosition(40, 60)
cardKit.setCardLayoutSpacing(PlayerHand, -14)
for(let i = 0; i < 10; i++) {
    cardKit.moveCardBetween(CardStack, CardContainerPositions.First, PlayerHand, CardContainerPositions.Last, i % 2 == 0 ? CardFacingModifiers.FaceUp : CardFacingModifiers.FaceDown)
}
cardKit.setCursorAnchor(CardCursorAnchors.Center, 2, -2)
cardKit.moveCursorInsideLayoutWithButtons(PlayerHand)
let DiscardPile = cardKit.createEmptyHand(0, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Center)
DiscardPile.setPosition(120, 60)
cardKit.setCardLayoutSpacing(DiscardPile, -14)

