// enum CardAttributes {
//     Rank,
//     Suit,
//     Selected,
//     Flipped
// }
// controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
//     while (cardKit.getCursorCard() != cardKit.getContainerCardAtPosition(PlayerHand, CardContainerPositions.Last)) {
//         cardKit.moveCardBetween(PlayerHand, CardContainerPositions.Last, DiscardPile, CardContainerPositions.Last, CardFacingModifiers.Unchanged)
//     }
// })

// let CardStack = cardKit.createPlayingCards()
// let PlayerHand = cardKit.createEmptyHand(0, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Center)
// PlayerHand.setPosition(40, 60)
// cardKit.setCardLayoutSpacing(PlayerHand, -14)
// for(let i = 0; i < 10; i++) {
//     cardKit.moveCardBetween(CardStack, CardContainerPositions.First, PlayerHand, CardContainerPositions.Last, i % 2 == 0 ? CardFacingModifiers.FaceUp : CardFacingModifiers.FaceDown)
// }
// cardKit.setCursorAnchor(CardCursorAnchors.Center, 2, -2)
// cardKit.moveCursorInsideLayoutWithButtons(PlayerHand)
// let DiscardPile = cardKit.createEmptyHand(0, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Center)
// DiscardPile.setPosition(120, 60)
// cardKit.setCardLayoutSpacing(DiscardPile, -14)

enum CardAttributes {
    Rank,
    Suit,
    Selected,
    Flipped,
    SuitColor
}
enum CardContainerKinds {
    Draw,
    Discard,
    Hand,
    Grid,
    Player,
    Puzzle
}
function FlipCards () {
    if (!(cardKit.getCardFaceUp(cardKit.getCursorCard()))) {
        cardKit.flipCard(cardKit.getCursorCard())
        FlipCount += 1
        if (FlipCount == 1) {
            FirstCard = cardKit.getCursorCard()
        } else {
            SecondCard = cardKit.getCursorCard()
        }
    }
    if (FlipCount == 2) {
        pause(500)
        if (cardKit.getCardNumberAttribute(FirstCard, CardAttributes.Rank) == cardKit.getCardNumberAttribute(SecondCard, CardAttributes.Rank)) {
            cardKit.addCardTo(
            DiscardPile,
            FirstCard,
            CardContainerPositions.First,
            CardFaces.Unchanged
            )
            cardKit.addCardTo(
            DiscardPile,
            SecondCard,
            CardContainerPositions.First,
            CardFaces.Unchanged
            )
            if (cardKit.getContainerCardCount(PlayGrid) == 0) {
                pause(1000)
                game.setGameOverEffect(true, effects.blizzard)
                game.gameOver(true)
            }
        } else {
            info.changeLifeBy(-1)
            cardKit.flipCard(FirstCard)
            cardKit.flipCard(SecondCard)
        }
        FlipCount = 0
    }
}

cardKit.createSelectEvent(CardContainerKinds.Grid, (container, card) => {
    FlipCards()
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (isOnTitleScreen) {
        isOnTitleScreen = false
        sprites.destroy(TitleCard, effects.blizzard, 500)
        pause(1000)
        SetupDeck()
        // SetupPlayField()
    }
})
function SetupPlayField () {
    PlayGrid = cardKit.createEmptyGrid(CardContainerKinds.Grid, 3, 6, CardGridScrollDirections.UpDown)
    cardKit.setCardLayoutWrapping(PlayGrid, true)
    DiscardPile = cardKit.createEmptyPile(CardContainerKinds.Discard)
    cardKit.setContainerPosition(DiscardPile, 140, 60)
    cardKit.lockGridCardPositions(PlayGrid)
    cardKit.moveCursorInsideLayoutWithButtons(PlayGrid)
    while (cardKit.getContainerCardCount(CardDeck) > 0) {
        cardKit.moveCardBetween(CardDeck, CardContainerPositions.First, PlayGrid, CardContainerPositions.Last, CardFaces.Down)
        pause(200)
    }
    info.setLife(16)
}
function SetupDeck () {
    CardDeck = cardKit.createPlayingCards()
    CardDeck.setPosition(20, 60)
    DeleteCardsList = cardKit.getLayoutCardListCopy(CardDeck)
    for (let Card of DeleteCardsList) {
        if (cardKit.getCardNumberAttribute(Card, CardAttributes.Rank) > 9) {
            sprites.destroy(Card)
        } else if (cardKit.getCardTextAttribute(Card, CardAttributes.Suit) == "clubs") {
            sprites.destroy(Card)
        } else if (cardKit.getCardTextAttribute(Card, CardAttributes.Suit) == "diamonds") {
            sprites.destroy(Card)
        }
    }
    pause(400)
    cardKit.shuffleCards(CardDeck)
}
let DeleteCardsList: cardCore.Card[] = []
let CardDeck: cardCore.CardStack = null
let PlayGrid: cardCore.CardGrid = null
let DiscardPile: cardCore.CardStack = null
let SecondCard: cardCore.Card = null
let FirstCard: cardCore.Card = null
let FlipCount = 0
let TitleCard: Sprite = null
let isOnTitleScreen = false
scene.setBackgroundImage(assets.image`Fall Trees`)
isOnTitleScreen = true
TitleCard = sprites.create(img`
    ...............cc...................................................
    .cccc........ccccc..................................................
    cccccc......ccc1cc..................................................
    cc111cc.....cc111cc.................................................
    .c1111cc...cc1111cc.................................................
    .c1111cc..cc11111cc...cccc.....cccc.ccc.....ccc...cccccccc..c...ccc.
    .c11111ccccc11c11cc.ccccccc.cccccccccccc..cccccccccccccccccccccccccc
    .c111111ccc11cc11ccccc1111ccccc111cc111ccccc1111ccc11cc111cc1ccc11cc
    .c111c111c111cc11ccc11cc11ccc111c111111ccc111cc11cc11c11c1111ccc11cc
    .c111cc11111ccc11ccc11cc11cc1111c111111ccc11ccc111c1111cc1c11ccc11cc
    .c111ccc111cccc11cc11ccc11cc111cc111c11ccc11cccc11c1111cccc11ccc11cc
    .c111cccccccccc11cc11cc11ccc111cc111c11cc111c.cc11c111cc.cc11ccc11cc
    .c111c.cccc..cc11cc11111cccc111cc111c11cc11cc.cc11c111cc..c111cc11cc
    .c111c.......cc11c111ccccccc111cc111c11cc11cc.cc11cc11cc..cc11cc11cc
    .c111c.......cc11cc11cccc11c111cc111c11ccc11cccc11cc11cc..cc11cc111c
    .c111c.......cc11cc11ccc111cc11cc11ccc11cc11ccc11ccc11cc..cc11c1111c
    .c11cc.......cc11ccc11111cccc1cccc1ccc1111c11111cccc11cc...cc111c11c
    .ccccc.......ccccccccccccccccccccccccccccccccccccccccccc...cccccc11c
    .cccc.........cccc..ccccc...ccc..cc...cccccccccc...cccc...ccccccc11c
    .........................................................ccccccc11cc
    ........................................................cc111ccc11cc
    .........................................................ccc11111ccc
    ..........................................................ccccccccc.
    ............................................................ccccc...
    `, SpriteKind.Player)
FlipCount = 0

if (isOnTitleScreen) {
    isOnTitleScreen = false
    sprites.destroy(TitleCard)
    SetupDeck()
    SetupPlayField()
}

