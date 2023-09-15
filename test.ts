// tests go here; this will not be compiled when this package is used as an extension.
const deck = cardKit.createPlayingCards()

// controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
//     if(!!cardKit.getSelectedCard()) {
//         cardKit.getSelectedCard().flip()
//     }
// })

/*
Spread Test
*/

// Horizontal
// const hand = new cardKit.CardSpread(
//     scene.screenWidth() / 2,
//     scene.screenHeight() - 20,
//     1, [], 12, 20,
//     true,
//     1, -10, true
// )
// controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
//     hand.selectPreviousCard()
// })
// controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
//     hand.selectNextCard()
// })

// Vertical
// const hand = new cardKit.CardSpread(
//     20,
//     scene.screenHeight() / 2,
//     1, [], 12, 20,
//     false,
//     1, 6, true
// )
// controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
//     hand.selectPreviousCard()
// })
// controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
//     hand.selectNextCard()
// })

// hand.insertCardsFrom(deck, 5)

/*
Grid Test
*/
const grid = cards.createEmptyGrid(
    'grid',
    scene.screenWidth() / 2,
    scene.screenHeight() / 2,
    6, 4,
    false, false
)

while (deck.getCardCount() > 0) {
    grid.insertCard(deck.removeCard(), -1)
}

controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
    grid.selectPreviousColumnCard()
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.selectNextColumnCard()
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
    grid.selectPreviousRowCard()
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.selectNextRowCard()
})