enum CardAttributes {
    Rank,
    Suit,
    Selected,
    Flipped
}
function FlipCards () {
    if (cardKit.getCardNumberAttribute(cardKit.getCursorCard(), CardAttributes.Flipped) != 1) {
        cardKit.setCardNumberAttribute(cardKit.getCursorCard(), CardAttributes.Flipped, 1)
        CardsFlipped += 1
        cardKit.flipCard(cardKit.getCursorCard())
    }
    if (CardsFlipped == 2) {
        if (FlippedCardsMatch()) {
            for (let Card of FlippedCards) {
                cardKit.addCardTo(DiscardPile, Card, CardContainerPositions.First)
            }
            if (cardKit.getContainerCardCount(PlayGrid) == 0) {
                game.gameOver(true)
            }
        } else {
            pause(500)
            info.changeLifeBy(-1)
            for (let Card of FlippedCards) {
                cardKit.setCardNumberAttribute(Card, CardAttributes.Flipped, 0)
                cardKit.flipCard(Card)
            }
        }
        CardsFlipped = 0
    }
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isOnTitleScreen) {
        isOnTitleScreen = false
        sprites.destroy(TitleCard, effects.disintegrate, 500)
        // pause(1000)
        SetupPlayField()
    } else {
        FlipCards()
    }
})
function SetupPlayField () {
    CardStack = cardKit.createPlayingCards()
    DeleteCards = cardKit.filterCardListWithCondition(CardStack, CardAttributes.Suit, "clubs")
    for (let DeleteCard of DeleteCards) {
        DeleteCard.destroy()
    }
    DeleteCards = cardKit.filterCardListWithCondition(CardStack, CardAttributes.Suit, "diamonds")
    for (let DeleteCard of DeleteCards) {
        DeleteCard.destroy()
    }
    DeleteCards = cardKit.filterCardListWithCondition(CardStack, CardAttributes.Rank, "13")
    for (let DeleteCard of DeleteCards) {
        DeleteCard.destroy()
    }
    cardKit.shuffleCards(CardStack)
    CardStack.setPosition(20, 60)
    PlayGrid = cardKit.createEmptyGrid("Card Grid", 80, 60, 6, 4)
    DiscardPile = cardKit.createEmptyPile("Discard Pile")
    cardKit.setContainerPosition(DiscardPile, 140, 60)
    cardKit.lockGridCardPositions(PlayGrid)
    for (let index = 0; index < 24; index++) {
        cardKit.moveCardBetween(CardStack, CardContainerPositions.First, PlayGrid, CardContainerPositions.Last)
        // pause(500)
    }
    info.setLife(5)
    cardKit.moveCursorInsideLayoutWithButtons(PlayGrid)
}
function FlippedCardsMatch () {
    CardRank = cardKit.getCardNumberAttribute(cardKit.getCursorCard(), CardAttributes.Rank)
    FlippedCards = cardKit.filterCardListWithCondition(PlayGrid, CardAttributes.Flipped, "1")
    CardsMatch = 0
    for (let Card of FlippedCards) {
        if (cardKit.getCardNumberAttribute(Card, CardAttributes.Rank) != CardRank) {
            return false
        }
    }
    return true
}
let CardsMatch = 0
let CardRank = 0
let CardStack: cardCore.CardStack = null
let PlayGrid: cardCore.CardGrid = null
let DiscardPile: cardCore.CardStack = null
let FlippedCards: cardCore.Card[] = []
let DeleteCards: cardCore.Card[] = []
let CardsFlipped = 0
let TitleCard: Sprite = null
let isOnTitleScreen = false
isOnTitleScreen = true
TitleCard = sprites.create(img`
    ...............bb...................................................
    .bbbb........bbbbb..................................................
    bbbbbb......bbb1bb..................................................
    bb111bb.....bb111bb.................................................
    .b1111bb...bb1111bb.................................................
    .b1111bb..bb11111bb...bbbb.....bbbb.bbb.....bbb...bbbbbbbb..b...bbb.
    .b11111bbbbb11b11bb.bbbbbbb.bbbbbbbbbbbb..bbbbbbbbbbbbbbbbbbbbbbbbbb
    .b111111bbb11bb11bbbbb1111bbbbb111bb111bbbbb1111bbb11bb111bb1bbb11bb
    .b111b111b111bb11bbb11bb11bbb111b111111bbb111bb11bb11b11b1111bbb11bb
    .b111bb11111bbb11bbb11bb11bb1111b111111bbb11bbb111b1111bb1b11bbb11bb
    .b111bbb111bbbb11bb11bbb11bb111bb111b11bbb11bbbb11b1111bbbb11bbb11bb
    .b111bbbbbbbbbb11bb11bb11bbb111bb111b11bb111b.bb11b111bb.bb11bbb11bb
    .b111b.bbbb..bb11bb11111bbbb111bb111b11bb11bb.bb11b111bb..b111bb11bb
    .b111b.......bb11b111bbbbbbb111bb111b11bb11bb.bb11bb11bb..bb11bb11bb
    .b111b.......bb11bb11bbbb11b111bb111b11bbb11bbbb11bb11bb..bb11bb111b
    .b111b.......bb11bb11bbb111bb11bb11bbb11bb11bbb11bbb11bb..bb11b1111b
    .b11bb.......bb11bbb11111bbbb1bbbb1bbb1111b11111bbbb11bb...bb111b11b
    .bbbbb.......bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb...bbbbbb11b
    .bbbb.........bbbb..bbbbb...bbb..bb...bbbbbbbbbb...bbbb...bbbbbbb11b
    .........................................................bbbbbbb11bb
    ........................................................bb111bbb11bb
    .........................................................bbb11111bbb
    ..........................................................bbbbbbbbb.
    ............................................................bbbbb...
    `, SpriteKind.Player)
CardsFlipped = 0
