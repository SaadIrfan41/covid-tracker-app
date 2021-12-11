import type { NextPage } from 'next'
import useAxios from 'axios-hooks'
import axios from 'axios'
import Image from 'next/image'
import { Fragment, useEffect, useState } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
const Map = dynamic(() => import('../components/Maps'), { ssr: false })

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import Maps from '../components/Maps'
import dynamic from 'next/dynamic'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Covid 19 Cases',
    },
  },
}

const Home: NextPage = () => {
  const [countryinfo, setcountryinfo] = useState({})
  const [casesdata, setcasesdata] = useState({})
  const [deathsdata, setdeathsdata] = useState({})
  const [recovereddata, setrecovereddata] = useState({})

  const buildChartData = (data: any, casesType: any) => {
    let chartData = []
    let lastDataPoint
    for (let date in data.cases) {
      if (lastDataPoint) {
        let newDataPoint = {
          x: date,
          y: data[casesType][date] - lastDataPoint,
        }
        chartData.push(newDataPoint)
      }
      lastDataPoint = data[casesType][date]
    }
    return chartData
  }
  useEffect(() => {
    async function fetchMyAPI() {
      try {
        const response = await axios.get('https://disease.sh/v3/covid-19/all')
        const chartresponse = await axios.get(
          'https://disease.sh/v3/covid-19/historical/all?lastdays=120'
        )
        console.log('CHART DATA', chartresponse.data)
        let casesData = buildChartData(chartresponse.data, 'cases')
        let deathsData = buildChartData(chartresponse.data, 'deaths')
        let recoveredData = buildChartData(chartresponse.data, 'recovered')

        setcasesdata(casesData)
        setdeathsdata(deathsData)
        setrecovereddata(recoveredData)

        setcountryinfo(response.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchMyAPI()
  }, [])

  const [mapCenter, setMapCenter] = useState({ lat: 34.80746, lng: -40.4796 })

  const [{ data, loading, error }, refetch] = useAxios(
    'https://disease.sh/v3/covid-19/countries'
  )

  if (loading) return <p>Loading...</p>
  if (error) return <p>Error!</p>
  console.log('INTERESTED DATA', data)
  // console.log('Chart DATA', chartdata)
  const sortedData = [...data]
  sortedData.sort((a, b) => (a.cases > b.cases ? -1 : 1))

  const onCountryChange = async (event: any) => {
    const countrycode = event.target.value
    const url =
      countrycode === 'worldwide'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${countrycode}`

    try {
      const response = await axios.get(url)
      console.log('COUNTRY DATA', response)
      setcountryinfo(response.data)
      //@ts-ignore
      setMapCenter([
        response.data.countryInfo.lat,
        response.data.countryInfo.long,
      ])
    } catch (error) {
      console.error(error)
    }
  }

  const chartlinedata = {
    // label: [],
    datasets: [
      {
        label: 'Cases',
        data: casesdata,
        borderColor: 'rgb(99, 172, 255)',
        backgroundColor: 'rgba(99, 161, 255, 0.5)',
      },

      {
        label: 'Deaths',
        data: deathsdata,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Recovered',
        data: recovereddata,
        borderColor: 'rgb(99, 255, 146)',
        backgroundColor: 'rgba(99, 255, 221, 0.5)',
      },
    ],
  }

  return (
    <div className='lg:flex justify-evenly'>
      <div>
        <div className='bg-gray-50 pt-12 sm:pt-16'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='max-w-4xl mx-auto text-center flex flex-col items-center'>
              <h2 className='text-3xl font-extrabold text-gray-900 sm:text-4xl'>
                CoronaVirus Worldwide Cases
              </h2>
              <div className=' w-40 pt-5'>
                <select
                  className='bg-blue-100 mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md'
                  // value={country}
                  onChange={onCountryChange}
                >
                  <option value='worldwide'>Select Country...</option>
                  {data.map((country: any) => {
                    return (
                      <option
                        key={country.country}
                        value={country.countryInfo.iso3}
                      >
                        {country.country}
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>
          </div>
          <div className='mt-10 pb-12 bg-white sm:pb-16'>
            <div className='relative'>
              <div className='absolute inset-0 h-1/2 bg-gray-50' />
              <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='max-w-4xl mx-auto'>
                  <dl className='rounded-lg bg-white shadow-lg sm:grid sm:grid-cols-3'>
                    <div className='flex flex-col border-b border-gray-100 p-6 text-center sm:border-0 sm:border-r'>
                      <dt className='order-1 mt-2 text-lg leading-6 font-medium text-gray-500'>
                        CoronaVirus Cases
                      </dt>
                      <dd className='order-2 text-5xl font-extrabold text-indigo-600'>
                        {countryinfo?.todayCases}
                      </dd>
                      <dt className='order-3 mt-2 text-lg leading-6 font-medium text-gray-500'>
                        {countryinfo?.cases}Total
                      </dt>
                    </div>
                    <div className='flex flex-col border-t border-b border-gray-100 p-6 text-center sm:border-0 sm:border-l sm:border-r'>
                      <dt className='order-1 mt-2 text-lg leading-6 font-medium text-gray-500'>
                        Recovered
                      </dt>
                      <dd className='order-2 text-5xl font-extrabold text-indigo-600'>
                        {countryinfo?.todayRecovered}
                      </dd>
                      <dt className='order-3 mt-2 text-lg leading-6 font-medium text-gray-500'>
                        {countryinfo?.recovered}Total
                      </dt>
                    </div>
                    <div className='flex flex-col border-t border-gray-100 p-6 text-center sm:border-0 sm:border-l'>
                      <dt className='order-1 mt-2 text-lg leading-6 font-medium text-gray-500'>
                        Deaths
                      </dt>
                      <dd className='order-2 text-5xl font-extrabold text-indigo-600'>
                        {countryinfo?.todayDeaths}
                      </dd>
                      <dt className='order-3 mt-2 text-lg leading-6 font-medium text-gray-500'>
                        {countryinfo?.deaths}Total
                      </dt>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='map'>
          <Map center={mapCenter} data={data} />
        </div>
      </div>
      <div>
        <div>
          <Line options={options} data={chartlinedata} />
        </div>
        <div className='flex flex-col p-3 '>
          <div className='-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8 max-h-screen'>
              <div className='shadow overflow-hidden border-b border-gray-200 sm:rounded-lg  '>
                <table className='min-w-full divide-y divide-gray-200  '>
                  <thead className='bg-gray-50  '>
                    <tr>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Country
                      </th>
                      <th
                        scope='col'
                        className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        Total Cases
                      </th>
                    </tr>
                  </thead>
                  <tbody className='overflow-auto'>
                    {sortedData.map((country, index: number) => (
                      <tr
                        key={country.country}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                      >
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {country.country}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {country.cases}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
