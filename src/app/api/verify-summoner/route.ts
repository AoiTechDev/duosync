import { NextRequest, NextResponse } from 'next/server'

const RIOT_API_KEY = process.env.RIOT_API_KEY
const REGION_ENDPOINTS = {
  'NA1': 'na1.api.riotgames.com',
  'EUW1': 'euw1.api.riotgames.com',
  'EUN1': 'eun1.api.riotgames.com',
  'KR': 'kr.api.riotgames.com',
  'BR1': 'br1.api.riotgames.com',
  'LA1': 'la1.api.riotgames.com',
  'LA2': 'la2.api.riotgames.com',
  'OC1': 'oc1.api.riotgames.com',
  'RU': 'ru.api.riotgames.com',
  'TR1': 'tr1.api.riotgames.com',
  'JP1': 'jp1.api.riotgames.com',
}

const REGIONAL_ENDPOINTS = {
  'NA1': 'americas.api.riotgames.com',
  'EUW1': 'europe.api.riotgames.com',
  'EUN1': 'europe.api.riotgames.com',
  'KR': 'asia.api.riotgames.com',
  'BR1': 'americas.api.riotgames.com',
  'LA1': 'americas.api.riotgames.com',
  'LA2': 'americas.api.riotgames.com',
  'OC1': 'sea.api.riotgames.com',
  'RU': 'europe.api.riotgames.com',
  'TR1': 'europe.api.riotgames.com',
  'JP1': 'asia.api.riotgames.com',
}

interface RankedEntry {
  queueType: string;
  tier: string;
  rank: string;
}

export async function POST(request: NextRequest) {
  try {
    const { gameName, tagLine, region } = await request.json()
    
    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { success: false, message: 'Riot API key not configured' },
        { status: 500 }
      )
    }
    
    const regionalEndpoint = REGIONAL_ENDPOINTS[region as keyof typeof REGIONAL_ENDPOINTS]
    const platformEndpoint = REGION_ENDPOINTS[region as keyof typeof REGION_ENDPOINTS]
    
    if (!regionalEndpoint || !platformEndpoint) {
      return NextResponse.json(
        { success: false, message: 'Invalid region' },
        { status: 400 }
      )
    }
    
    // Get account by riot ID (gameName#tagLine)
    //https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/Jinx/HardcoreJinx?api_key=RGAPI-9cf5f5cf-a9aa-4c72-9ae4-26828860dfa9
    const accountResponse = await fetch(
      `https://${regionalEndpoint}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${RIOT_API_KEY}`
    )
    
    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        return NextResponse.json({
          success: false,
          message: 'Account not found'
        })
      }
      throw new Error('Riot API request failed')
    }
    
    const account = await accountResponse.json()
    
    // Get summoner by PUUID
    const summonerResponse = await fetch(
      `https://${platformEndpoint}/lol/summoner/v4/summoners/by-puuid/${account.puuid}?api_key=${RIOT_API_KEY}`
    )
    
    if (!summonerResponse.ok) {
      return NextResponse.json({
        success: false,
        message: 'Summoner not found for this region'
      })
    }
    
    const summoner = await summonerResponse.json()
    
    // Get rank information
    const rankedResponse = await fetch(
      `https://${platformEndpoint}/lol/league/v4/entries/by-summoner/${summoner.id}?api_key=${RIOT_API_KEY}`
    )
    
    let currentRank = 'UNRANKED'
    if (rankedResponse.ok) {
      const rankedData: RankedEntry[] = await rankedResponse.json()
      const soloQueue = rankedData.find((entry) => entry.queueType === 'RANKED_SOLO_5x5')
      if (soloQueue) {
        currentRank = `${soloQueue.tier}_${soloQueue.rank}`
      }
    }
    
    return NextResponse.json({
      success: true,
      data: {
        summonerName: `${account.gameName}#${account.tagLine}`,
        gameName: account.gameName,
        tagLine: account.tagLine,
        level: summoner.summonerLevel,
        currentRank,
        puuid: account.puuid,
        summonerId: summoner.id
      }
    })
  } catch (error) {
    console.error('Riot API error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to verify summoner' },
      { status: 500 }
    )
  }
}