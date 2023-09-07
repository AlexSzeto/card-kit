// tests go here; this will not be compiled when this package is used as an extension.
const playingCardLayout = new cardKit.CardLayoutData(
    12,
    20,
    img`
            . c c c c .
            c b 1 1 b c
            c 1 1 1 1 c
            c 1 1 1 1 c
            c b 1 1 b c
            . c c c c .
        `,
    img`
            . 2 2 2 2 .
            2 4 d d 4 2
            2 d 2 3 d 2
            2 d 3 2 d 2
            2 4 d d 4 2
            . 2 2 2 2 .
        `,
    img`
            . b .
            b b b
            . b .
        `,
    img`
            . e .
            e e e
            . e .
        `,
    5,
    10,
    12,
    {
        'heart': img`
            . 2 . 2 .
            2 2 2 2 2
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `,
        'diamond': img`
            . . 2 . .
            . 2 2 2 .
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `,
        'club': img`
            . f f f .
            f f f f f
            f f f f f
            f . f . f
            . . f . .
            . f f f .
            `,
        'spades': img`
            . . f . .
            . f f f .
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `,
    },
    ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    [
        new cardKit.LayoutRowData(
            CardLayoutAlignments.Center,
            [
                new cardKit.LayoutColumnData(CardLayoutSubjects.Value, '', 15, 2, 1),
                new cardKit.LayoutColumnData(CardLayoutSubjects.Space, null, 0, 2, 0),
            ]
        ),
        new cardKit.LayoutRowData(
            CardLayoutAlignments.Center,
            [
                new cardKit.LayoutColumnData(CardLayoutSubjects.Icon),
                new cardKit.LayoutColumnData(CardLayoutSubjects.Space, null, 0, 2, 0),
            ]
        )
    ],
    2,
    1,
)

const playingCardDeckData = []
for (const suit of ['spades', 'diamond', 'club', 'heart']) {
    for (let rank = 1; rank <= 13; rank++) {
        playingCardDeckData.push(new cardKit.CardData(
            playingCardLayout.valueText[rank] + suit.charAt(0).toUpperCase(),
            `${playingCardLayout.valueText[rank]} of ${suit}`,
            suit,
            rank
        ))
    }
}

const deck = new cardKit.CardStack(playingCardLayout, playingCardDeckData, false, false)
// const hand = new cardKit.CardSpread([], scene.screenWidth() / 2, scene.screenHeight() - 30, true, 1)

// controller.left.onEvent(ControllerButtonEvent.Pressed, function() {
//     hand.selectPrevious()
// })

// controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
//     hand.selectNext()
// })

// controller.A.onEvent(ControllerButtonEvent.Pressed, function() {
//     if(!!cardKit.getSelectedCard()) {
//         cardKit.getSelectedCard().flip()
//     }
// })
// while (deck.data.length > 0 && hand.cards.length < 10) {
//     let card = deck.createCard()
//     hand.cards.push(card)
//     hand.reposition()
//     pause(500)
// }

const grid = new cardKit.CardGrid([], scene.screenWidth() / 2, scene.screenHeight() / 2, 4, 6, false, 1)
while (deck.data.length > 0 && grid.cards.length < 24) {
    let card = deck.createCard()
    grid.cards.push(card)
}