namespace cardKit {
    let playingCardsDeckData: cardKitCore.CardData[]
    export function createPlayingCards(): cardKitCore.CardStack {
        const rankToTextLookupTable = ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        const rankToDescriptionLookupTable = ['Joker', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King']
        const playingCardLayout = new cardKitCore.CardLayout(
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
            12,
            [
                new cardKitCore.LayoutRow(
                    CardZoneAlignments.Center,
                    [
                        cardKitCore.createAttributeAsLookupTextLayout('rank', 15, 2, 1,
                        cardKitCore.createNumberToTextLookupTable(rankToTextLookupTable)
                        ),
                        cardKitCore.createEmptySpaceLayout(2, 0),
                    ]
                ),
                new cardKitCore.LayoutRow(
                    CardZoneAlignments.Center,
                    [
                        cardKitCore.createAttributeAsLookupImageLayout('suit', [
                            new cardKitCore.LayoutLookup('spades', img`
                            . . f . .
                            . f f f .
                            f f f f f
                            f f f f f
                            . . f . .
                            . f f f .
                            `),
                            new cardKitCore.LayoutLookup('diamond', img`
                            . . 2 . .
                            . 2 2 2 .
                            2 2 2 2 2
                            2 2 2 2 2
                            . 2 2 2 .
                            . . 2 . .
                            `),
                            new cardKitCore.LayoutLookup('club', img`
                            . f f f .
                            f f f f f
                            f f f f f
                            f . f . f
                            . . f . .
                            . f f f .
                            `),
                            new cardKitCore.LayoutLookup('heart', img`
                            . 2 . 2 .
                            2 2 2 2 2
                            2 2 2 2 2
                            2 2 2 2 2
                            . 2 2 2 .
                            . . 2 . .
                            `),
                        ]),
                        cardKitCore.createEmptySpaceLayout(2, 0),
                    ]
                )
            ],
            2,
            1
        )

        const playingCardDeckData = []
        for (const suit of ['spades', 'diamond', 'club', 'heart']) {
            for (let rank = 1; rank <= 13; rank++) {
                const cardData = new cardKitCore.CardData(
                    rankToTextLookupTable[rank] + suit.charAt(0).toUpperCase(),
                    `${rankToDescriptionLookupTable[rank]} of ${suit.charAt(0).toUpperCase()}${suit.substr(1)}`,
                    null
                )
                cardData.setAttribute('suit', suit)
                cardData.setAttribute('rank', rank)
                playingCardDeckData.push(cardData)
            }
        }

        return new cardKitCore.CardStack(
            playingCardLayout,
            playingCardDeckData,
            false,
            false
        )
    }
}