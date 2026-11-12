'use client'

import { useState } from 'react'
import Link from 'next/link'

type WeatherData = {
  temperature: number
  feelsLike: number
  humidity: number
  windSpeed: number
  weatherCode: number
  city: string
  country: string
}

function getWeatherDescription(code: number) {
  if (code === 0) return 'Clear sky'
  if ([1, 2, 3].includes(code)) return 'Partly cloudy'
  if ([45, 48].includes(code)) return 'Foggy'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle'
  if ([61, 63, 65, 66, 67].includes(code)) return 'Rain'
  if ([71, 73, 75, 77].includes(code)) return 'Snow'
  if ([80, 81, 82].includes(code)) return 'Rain showers'
  if ([85, 86].includes(code)) return 'Snow showers'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Weather conditions unavailable'
}

export default function WeatherPage() {
  const [city, setCity] = useState('Dublin')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('Enter a city and select Search Weather.')

  async function searchWeather(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!city.trim()) {
      setMessage('Please enter a city name.')
      return
    }

    setLoading(true)
    setMessage('')
    setWeather(null)

    try {
      // Step 1: Find the city's geographical coordinates
      const locationUrl = new URL(
        'https://geocoding-api.open-meteo.com/v1/search'
      )

      locationUrl.search = new URLSearchParams({
        name: city.trim(),
        count: '1',
        language: 'en',
        format: 'json',
      }).toString()

      const locationResponse = await fetch(locationUrl.toString())

      if (!locationResponse.ok) {
        throw new Error('Could not find the city. Please try again.')
      }

      const locationData = await locationResponse.json()
      const place = locationData.results?.[0]

      if (!place) {
        throw new Error('City not found. Check the spelling and try again.')
      }

      // Step 2: Get the weather for the selected city
      const weatherUrl = new URL(
        'https://api.open-meteo.com/v1/forecast'
      )

      weatherUrl.search = new URLSearchParams({
        latitude: String(place.latitude),
        longitude: String(place.longitude),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
        timezone: 'auto',
      }).toString()

      const weatherResponse = await fetch(weatherUrl.toString())

      if (!weatherResponse.ok) {
        throw new Error('Unable to retrieve weather information.')
      }

      const weatherData = await weatherResponse.json()

      setWeather({
        temperature: weatherData.current.temperature_2m,
        feelsLike: weatherData.current.apparent_temperature,
        humidity: weatherData.current.relative_humidity_2m,
        windSpeed: weatherData.current.wind_speed_10m,
        weatherCode: weatherData.current.weather_code,
        city: place.name,
        country: place.country,
      })

      setMessage('')
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-3xl">

        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-700">
              StudyHub Weather
            </h1>
            <p className="text-slate-600">
              Check the weather before planning your study day.
            </p>
          </div>

          <Link
            href="/dashboard"
            className="rounded-lg bg-slate-800 px-5 py-3 text-white hover:bg-slate-700"
          >
            Back to Dashboard
          </Link>
        </header>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-800">
            Search for a city
          </h2>

          <form onSubmit={searchWeather} className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="Enter a city, e.g. Dublin"
              className="min-w-0 flex-1 rounded-lg border border-slate-300 p-3 text-slate-800"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search Weather'}
            </button>
          </form>

          {message && (
            <p className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800">
              {message}
            </p>
          )}
        </section>

        {weather && (
          <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
            <div className="mb-6 text-center">
              <p className="text-slate-500">
                Current weather for
              </p>

              <h2 className="mt-1 text-2xl font-bold text-slate-800">
                {weather.city}, {weather.country}
              </h2>

              <p className="mt-3 text-5xl font-bold text-blue-700">
                {weather.temperature}°C
              </p>

              <p className="mt-2 text-lg text-slate-600">
                {getWeatherDescription(weather.weatherCode)}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-blue-50 p-4 text-center">
                <p className="text-sm text-slate-500">
                  Feels like
                </p>
                <p className="mt-2 text-2xl font-bold text-blue-700">
                  {weather.feelsLike}°C
                </p>
              </div>

              <div className="rounded-xl bg-purple-50 p-4 text-center">
                <p className="text-sm text-slate-500">
                  Humidity
                </p>
                <p className="mt-2 text-2xl font-bold text-purple-700">
                  {weather.humidity}%
                </p>
              </div>

              <div className="rounded-xl bg-green-50 p-4 text-center">
                <p className="text-sm text-slate-500">
                  Wind speed
                </p>
                <p className="mt-2 text-2xl font-bold text-green-700">
                  {weather.windSpeed} km/h
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Weather data provided by Open-Meteo.
            </p>
          </section>
        )}

      </div>
    </main>
  )
}
