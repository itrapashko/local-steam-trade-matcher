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
}

export function BotResultCard({ result }: BotResultCardProps) {
  const { bot, cards, gameAppId } = result
  const steamId = bot.SteamIDText
  const avatarUrl = buildAvatarUrl(bot.AvatarHash)
  const cardTotal = totalCardCount(cards)
  const tradeMode = getBotTradeMode(bot)

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
            <span className="bot-stats">{cardTotal} карточек</span>
          </div>
          <div className="bot-links">
            <a
              href={buildGameCardsUrl(steamId, gameAppId)}
              target="_blank"
              rel="noreferrer"
            >
              Карточки игры
            </a>
            <a href={buildInventoryUrl(steamId)} target="_blank" rel="noreferrer">
              Инвентарь
            </a>
            <a
              href={buildTradeOfferUrl(steamId, bot.TradeToken)}
              target="_blank"
              rel="noreferrer"
            >
              Трейд
            </a>
          </div>
        </div>
      </header>
      <ul className="card-list">
        {cards.map((card) => (
          <li key={card.name} className="card-item">
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
