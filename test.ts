let TableauPile: cardCore.CardSpread = null
let ScoringPile: cardCore.CardStack = null
let CenterY = scene.screenHeight() / 2
let DrawDeck = cardKit.createPlayingCards()
cardKit.setContainerPosition(DrawDeck, 20, 60)
// let PileOutline = sprites.create(assets.image`ScoringPileOutline`, SpriteKind.Player)
// PileOutline.setPosition(33, 65)
let DiscardPile = cardKit.createEmptyPile("Discard Pile")
cardKit.setContainerPosition(DiscardPile, 34, 60)
let ScoringPileList: cardCore.CardStack[] = []
for (let Index = 0; Index <= 3; Index++) {
    // PileOutline = sprites.create(assets.image`ScoringPileOutline`, SpriteKind.Player)
    // PileOutline.setPosition(55 + 14 * Index, 20)
    ScoringPile = cardKit.createEmptyPile("Scoring Pile")
    cardKit.setContainerPosition(ScoringPile, 55 + 14 * Index, 14)
    ScoringPileList.push(ScoringPile)
}
let TableauPileList: cardCore.CardStack[] = []
for (let Index = 0; Index <= 0; Index++) {
    TableauPile = cardKit.createEmptyHand("Tableau Pile", 55 + 14 * Index, 32, CardLayoutSpreadDirections.UpDown, CardLayoutSpreadAlignments.Start, false)
    cardKit.setCardLayoutSpacing(TableauPile, -14)
    for (let index = 0; index < Index + 7; index++) {
        cardKit.moveCardBetween(DrawDeck, CardContainerPositions.First, TableauPile, CardContainerPositions.First)
    }
    // cardKit.setCardFaceUp(cardKit.getContainerCardAtPosition(TableauPile, CardContainerPositions.Last), true)
    TableauPileList.push(ScoringPile)
}
