namespace cardKit {
    let playingCardsDesignTemplate: cardDesign.CardDesignTemplate = null
    
    //% color="#255f74"
    //% group="Playing Cards Preset"
    //% block="playing cards design"
    export function getPlayingCardsDesign(): cardDesign.CardDesignTemplate {
        if (!playingCardsDesignTemplate) {
            let design = cardDesign.createCardDesignTemplate()
            design.backFrame = img`
            . 2 2 2 2 .
            2 4 d d 4 2
            2 d 2 3 d 2
            2 d 3 2 d 2
            2 4 d d 4 2
            . 2 2 2 2 .
            `
            cardDesign.addAttributeIndexText(design, CardZoneAlignments.Center, 0, ['JK', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'])
            cardDesign.addEmptySpace(design, CardZoneAlignments.Center, 2, 0)
            cardDesign.editNextRow(design)
            cardDesign.addAttributeTextToImage(design, CardZoneAlignments.Center, 1, [
                cardDesign.createTextToImageLookupPair('spades', img`
            . . f . .
            . f f f .
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
                cardDesign.createTextToImageLookupPair('diamonds', img`
            . . 2 . .
            . 2 2 2 .
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
                cardDesign.createTextToImageLookupPair('clubs', img`
            . f f f .
            f f f f f
            f f f f f
            f f f f f
            . . f . .
            . f f f .
            `),
                cardDesign.createTextToImageLookupPair('hearts', img`
            . 2 . 2 .
            2 2 2 2 2
            2 2 2 2 2
            2 2 2 2 2
            . 2 2 2 .
            . . 2 . .
            `),
            ])
            cardDesign.addEmptySpace(design, CardZoneAlignments.Center, 2, 0)
            playingCardsDesignTemplate = design
        }
        return playingCardsDesignTemplate
    }

    //% group="Playing Cards Preset" blockSetVariable="myCardContainer"
    //% block="deck of playing cards"
    export function createPlayingCards(): cardCore.CardStack {
        let deck = cardDesign.createEmptyDeck(getPlayingCardsDesign(), 'Playing Cards')
        cardDesign.addCardVariantsToDeck(deck,
            [
                cardDesign.createTextAttributeVariations(1, ['spades', 'diamonds', 'clubs', 'hearts']),
                cardDesign.createNumberAttributeVariations(0, 1, 13)
            ]
        )
        return deck
    }
}