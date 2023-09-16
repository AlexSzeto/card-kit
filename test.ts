// tests go here; this will not be compiled when this package is used as an extension.
const deck = cardKit.createPlayingCards()
deck.x = 30

const discard = cards.createEmptyStack('discard', cardKit.getPlayingCardsDesign().export(), true)
discard.z = 20
discard.x = scene.screenWidth() - 30

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    if (!!cardKit.getCursorCard()) {
        // cardKit.getCursorCard().flip()
        let card = grid.removeCard(0) //grid.getCursorIndex())
        card.z = 30
        hand.insertCard(card, -1)
        
        if (hand.getCardCount() > 5) {
            let card2 = hand.removeCard(0)
            card2.z = 30
            discard.insertCard(card2, 0)
        }
    }
})

/*
Spread Test
*/

// Horizontal
const hand = new cardKit.CardSpread(
    'hand',
    scene.screenWidth() / 2,
    scene.screenHeight() - 20,
    10, [], true, true,
    1, -10, true
)
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
    scene.screenHeight() / 2 - 10,
    6, 3,
    true, false, false
)

controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
    grid.moveCursorLeft()
})

controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.moveCursorRight()
})
controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
    grid.moveCursorUp()
})

controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
    grid.moveCursorDown()
})

while (deck.getCardCount() > 0) {
    grid.insertCard(deck.removeCard(), -1)
}

