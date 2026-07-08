import { useMemo } from 'react'
import type { BotMatchResult } from '../types/steam'
import { getBotTradeMode } from '../types/asf'
import { totalCardCount } from '../services/parseGameCardsHtml'
import {
  buildAvatarUrl,
  buildGameCardsUrl,
  buildInventoryUrl,
  buildTradeOfferUrl,
} from '../utils/steamId'

interface BotResultCardProps {
  result: BotMatchResult
  selectedCardNames: string[]
}

export function BotResultCard({ result, selectedCardNames }: BotResultCardProps) {
  const { bot, cards, gameAppId, cardType } = result
  const steamId = bot.SteamIDText
  const avatarUrl = buildAvatarUrl(bot.AvatarHash)
  const cardTotal = totalCardCount(cards)
  const tradeMode = getBotTradeMode(bot)
  const selectedSet = useMemo(() => new Set(selectedCardNames), [selectedCardNames])

  return (
    <article className="bot-card">
      <header className="bot-card-header">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="bot-avatar" />
        ) : (
          <div className="bot-avatar placeholder" aria-hidden />
        )}
        <div className="bot-meta">
          <div className="bot-title-row">
            <h3>{bot.Nickname}</h3>
            <span className={`trade-mode trade-mode-${tradeMode.toLowerCase()}`}>
              {tradeMode}
            </span>
            <span className="bot-stats">{cardTotal} cards</span>
          </div>
          <div className="bot-links">
            <a
              href={buildGameCardsUrl(steamId, gameAppId, cardType)}
              target="_blank"
              rel="noreferrer"
            >
              Game cards
            </a>
            <a href={buildInventoryUrl(steamId)} target="_blank" rel="noreferrer">
              Inventory
            </a>
            <a
              href={buildTradeOfferUrl(steamId, bot.TradeToken)}
              target="_blank"
              rel="noreferrer"
            >
              Trade
            </a>
          </div>
        </div>
      </header>
      <ul className="card-list">
        {cards.map((card) => (
          <li
            key={card.name}
            className={`card-item${selectedSet.has(card.name) ? ' selected' : ''}`}
          >
            {card.imageUrl && (
              <img src={card.imageUrl} alt="" className="card-icon" />
            )}
            <div className="card-label">
              <span className="card-name">{card.name}</span>
              {card.quantity > 1 && (
                <span className="card-qty">×{card.quantity}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </article>
  )
}
