namespace cardKit {
    let playingCardsDeckData: cardKit.CardData[]
    
    export function createPlayingCards(): cardKit.CardStack {
        const rankToTextLookupTable = ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        const playingCardLayout = new cardKit.CardLayout(
            12, 20,
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
            [
                new cardKit.LayoutRow(
                    CardZoneAlignments.Center,
                    [
                        cardKit.createAttributeAsLookupTextLayout(0, 15, 2, 1,
                        cardKit.createNumberToTextLookupTable(rankToTextLookupTable)
                        ),
                        cardKit.createEmptySpaceLayout(2, 0),
                    ]
                ),
                new cardKit.LayoutRow(
                    CardZoneAlignments.Center,
                    [
                        cardKit.createAttributeAsLookupImageLayout(1, [
                            new cardKit.LayoutLookup('spades', img`
                            . . f . .
                            . f f f .
                            f f f f f
                            f f f f f
                            . . f . .
                            . f f f .
                            `),
                            new cardKit.LayoutLookup('diamond', img`
                            . . 2 . .
                            . 2 2 2 .
                            2 2 2 2 2
                            2 2 2 2 2
                            . 2 2 2 .
                            . . 2 . .
                            `),
                            new cardKit.LayoutLookup('club', img`
                            . f f f .
                            f f f f f
                            f f f f f
                            f f f f f
                            . . f . .
                            . f f f .
                            `),
                            new cardKit.LayoutLookup('heart', img`
                            . 2 . 2 .
                            2 2 2 2 2
                            2 2 2 2 2
                            2 2 2 2 2
                            . 2 2 2 .
                            . . 2 . .
                            `),
                        ]),
                        cardKit.createEmptySpaceLayout(2, 0),
                    ]
                )
            ],
            2,
            1
        )

        const playingCardDeckData = []
        for (const suit of ['spades', 'diamond', 'club', 'heart']) {
            for (let rank = 1; rank <= 13; rank++) {
                const cardData = new cardKit.CardData(
                    null
                )
                cardData.setAttribute(0, rank)
                cardData.setAttribute(1, suit)
                playingCardDeckData.push(cardData)
            }
        }

        return new cardKit.CardStack(
            playingCardLayout,
            playingCardDeckData,
            false,
            false
        )
    }
}