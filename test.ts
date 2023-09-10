// tests go here; this will not be compiled when this package is used as an extension.
const deck = cardKit.createPlayingCards()

controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
    if(!!cardKitCore.getSelectedCard()) {
        cardKitCore.getSelectedCard().flip()
    }
})

/*
Spread Test
*/

// Horizontal
// const hand = new cardKitCore.CardSpread(
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
// const hand = new cardKitCore.CardSpread(
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
const grid = new cardKitCore.CardGrid(
    scene.screenWidth() / 2,
    scene.screenHeight() / 2,
    1,
    [],
    12, 20,
    4, 6,
    false,
    1,
    false,
    sprites.create(img`
    . . . f f . . .
    . . f 1 1 f . .
    . f 1 1 1 1 f .
    f 1 1 1 1 1 1 f
    f b b b b b b f
    . f f f f f f .
    `),
    sprites.create(img`
    . f f f f f f .
    f 1 1 1 1 1 1 f
    f b 1 1 1 1 b f
    . f b 1 1 b f .
    . . f b b f . .
    . . . f f . . .
    `)
)

deck.flipCardsUp()
grid.insertCardsFrom(deck, 52)

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