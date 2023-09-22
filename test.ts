// tests go here; this will not be compiled when this package is used as an extension.
const deck = cards.createPlayingCards()
// deck.setImage(img`
// . 7 7 7 7 .
// 7 1 1 1 1 7
// 7 1 1 1 1 7
// 7 1 1 1 1 7
// . 7 7 7 7 .
// `)
deck.x = 30

const discard = cards.createEmptyPile('discard')
// discard.z = 20
discard.x = scene.screenWidth() - 30

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    if (!!cardKit.getCursorCard()) {
        // cardKit.getCursorCard().flip()
        let card = grid.removeCardAt(grid.getCursorIndex())
        hand.insertCard(card, -1)
        // card.z = 30
        
        if (hand.getCardCount() > 5) {
            let card2 = hand.removeCardAt(0)
            discard.insertCard(card2, 0)
        //     card2.z = 30
        }
    }
})

/*
Spread Test
*/

// Horizontal
const hand = cards.createEmptyHand(
    'hand',
    scene.screenWidth() / 2,
    scene.screenHeight() - 20,
    CardLayoutSpreadDirections.LeftRight,    
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
    CardLayoutSpreadDirections.UpDown
)
cards.moveCursorInsideLayoutWithButtons(grid)
// cardKit.preselectCursorContainer(grid)

// controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
//     grid.moveCursorLeft()
// })

// controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
//     grid.moveCursorRight()
// })
// controller.up.onEvent(ControllerButtonEvent.Pressed, function() {
//     grid.moveCursorUp()
// })

// controller.down.onEvent(ControllerButtonEvent.Pressed, function () {
//     grid.moveCursorDown()
// })

while (deck.getCardCount() > 40) {
    grid.insertCard(deck.removeCardAt(), -1)
    pause(500)
}

