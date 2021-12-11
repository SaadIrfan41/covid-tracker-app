import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from 'react-leaflet'
import numeral from 'numeral'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css'
const Maps = ({ center, data }: any) => {
  console.log('MAP COMPONENT')
  console.log('map DATA', data)
  console.log(center)
  function SetViewOnClick({ coords }: any) {
    const map = useMap()
    map.setView(coords, map.getZoom())

    return null
  }

  const casesTypeColors = {
    cases: {
      hex: '#CC1034',
      rgb: 'rgb(204, 16, 52)',
      half_op: 'rgba(204, 16, 52, 0.5)',
      multiplier: 200,
    },
  }

  return (
    <div>
      <MapContainer center={center} zoom={4} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        />
        <Marker position={center}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
        {data.map((country: any) => (
          <div key={country.country}>
            <Circle
              center={[country.countryInfo.lat, country.countryInfo.long]}
              color={casesTypeColors['cases'].hex}
              fillColor={casesTypeColors['cases'].hex}
              fillOpacity={0.4}
              radius={
                Math.sqrt(country['cases']) *
                casesTypeColors['cases'].multiplier
              }
            >
              <Popup>
                <div className='info-container'>
                  <div
                    className='info-flag'
                    style={{
                      backgroundImage: `url(${country.countryInfo.flag})`,
                    }}
                  ></div>
                  <div className='info-name'>{country.country}</div>
                  <div className='info-confirmed'>
                    Cases: {numeral(country.cases).format('0,0')}
                  </div>
                </div>
              </Popup>
            </Circle>
          </div>
        ))}
        <SetViewOnClick coords={center} />
      </MapContainer>
    </div>
  )
}

export default Maps
