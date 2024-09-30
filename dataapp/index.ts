import mustache from 'mustache'
import axios from 'axios'
import { SolrRecord } from './types/solrrecord'
import _ from 'lodash'
import bodyParser from 'body-parser'
import { v4   as uuidv4, v4 } from 'uuid'
import ss from 'simple-statistics'
import crypto from 'crypto'
import { spawn } from 'child_process'
import session from 'express-session'
import bcrypt from 'bcryptjs'
import express, { Request, Response, NextFunction } from 'express';




const stateMapping: Record<string, string> = {
    "Alabama": "AL",
    "Kentucky": "KY",
    "Ohio": "OH",
    "Alaska": "AK",
    "Louisiana": "LA",
    "Oklahoma": "OK",
    "Arizona": "AZ",
    "Maine": "ME",
    "Oregon": "OR",
    "Arkansas": "AR",
    "Maryland": "MD",
    "Pennsylvania": "PA",
    "American Samoa": "AS",
    "Massachusetts": "MA",
    "Puerto Rico": "PR",
    "California": "CA",
    "Michigan": "MI",
    "Rhode Island": "RI",
    "Colorado": "CO",
    "Minnesota": "MN",
    "South Carolina": "SC",
    "Connecticut": "CT",
    "Mississippi": "MS",
    "South Dakota": "SD",
    "Delaware": "DE",
    "Missouri": "MO",
    "Tennessee": "TN",
    "District of Columbia": "DC",
    "Montana": "MT",
    "Texas": "TX",
    "Florida": "FL",
    "Nebraska": "NE",
    "Trust Territories": "TT",
    "Georgia": "GA",
    "Nevada": "NV",
    "Utah": "UT",
    "Guam": "GU",
    "New Hampshire": "NH",
    "Vermont": "VT",
    "Hawaii": "HI",
    "New Jersey": "NJ",
    "Virginia": "VA",
    "Idaho": "ID",
    "New Mexico": "NM",
    "Virgin Islands": "VI",
    "Illinois": "IL",
    "New York": "NY",
    "Washington": "WA",
    "Indiana": "IN",
    "North Carolina": "NC",
    "West Virginia": "WV",
    "Iowa": "IA",
    "North Dakota": "ND",
    "Wisconsin": "WI",
    "Kansas": "KS",
    "Northern Mariana Islands": "MP",
    "Wyoming": "WY"
  }

const streetSuffixMapping: Record<string, string> = {
    "Alley": "aly",
    "Alleyway": "alyw",
    "Anex": "anx",
    "Annex": "anx",
    "Arcade": "arc",
    "Avenue": "ave",
    "Bayou": "byu",
    "Beach": "bch",
    "Bend": "bnd",
    "Bluff": "blf",
    "Bottom": "btm",
    "Boulevard": "blvd",
    "Branch": "br",
    "Bridge": "brg",
    "Brook": "brk",
    "Bypass": "byp",
    "Camp": "cp",
    "Canyon": "cyn",
    "Cape": "cpe",
    "Causeway": "cswy",
    "Center": "ctr",
    "Circle": "cir",
    "Cliff": "clf",
    "Club": "clb",
    "Common": "cmn",
    "Corner": "cor",
    "Course": "crse",
    "Court": "ct",
    "Courts": "cts",
    "Cove": "cv",
    "Creek": "crk",
    "Crescent": "cres",
    "Crest": "crst",
    "Crossing": "xing",
    "Crossroad": "xrd",
    "Curve": "curv",
    "Dale": "dl",
    "Dam": "dm",
    "Drive": "dr",
    "Estate": "est",
    "Expressway": "expy",
    "Extension": "ext",
    "Falls": "fls",
    "Ferry": "fry",
    "Field": "fld",
    "Flat": "flt",
    "Ford": "frd",
    "Forest": "frst",
    "Forge": "frg",
    "Fork": "frk",
    "Fort": "ft",
    "Freeway": "fwy",
    "Garden": "gdn",
    "Gateway": "gtwy",
    "Glen": "gln",
    "Green": "grn",
    "Grove": "grv",
    "Harbor": "hbr",
    "Haven": "hvn",
    "Heights": "hts",
    "Highway": "hwy",
    "Hill": "hl",
    "Hollow": "holw",
    "Inlet": "inlt",
    "Island": "is",
    "Junction": "jct",
    "Key": "ky",
    "Knoll": "knl",
    "Lake": "lk",
    "Landing": "lndg",
    "Lane": "ln",
    "Light": "lgt",
    "Loaf": "lf",
    "Lock": "lck",
    "Locks": "lcks",
    "Lodge": "ldg",
    "Loop": "loop",
    "Mall": "mall",
    "Manor": "mnr",
    "Meadow": "mdw",
    "Mews": "mews",
    "Mill": "ml",
    "Mission": "msn",
    "Motorway": "mtwy",
    "Mount": "mt",
    "Mountain": "mtn",
    "Neck": "nck",
    "Orchard": "orch",
    "Overpass": "opas",
    "Park": "park",
    "Parkway": "pkwy",
    "Pass": "pass",
    "Path": "path",
    "Pike": "pike",
    "Pine": "pne",
    "Place": "pl",
    "Plain": "pln",
    "Plaza": "plz",
    "Point": "pt",
    "Port": "prt",
    "Prairie": "pr",
    "Radial": "radl",
    "Ramp": "ramp",
    "Ranch": "rnch",
    "Rapid": "rpd",
    "Rest": "rst",
    "Ridge": "rdg",
    "River": "riv",
    "Road": "rd",
    "Route": "rte",
    "Row": "row",
    "Rue": "rue",
    "Run": "run",
    "Shore": "shr",
    "Skyway": "skwy",
    "Spring": "spg",
    "Springs": "spgs",
    "Spur": "spur",
    "Square": "sq",
    "Station": "sta",
    "Stravenue": "stra",
    "Stream": "strm",
    "Street": "st",
    "Summit": "smt",
    "Terrace": "ter",
    "Throughway": "trwy",
    "Trace": "trce",
    "Track": "trak",
    "Trafficway": "trfy",
    "Trail": "trl",
    "Trailer": "trlr",
    "Tunnel": "tunl",
    "Turnpike": "tpke",
    "Underpass": "upas",
    "Union": "un",
    "Valley": "vly",
    "Viaduct": "via",
    "View": "vw",
    "Village": "vlg",
    "Ville": "vl",
    "Vista": "vis",
    "Walk": "walk",
    "Way": "way",
    "Well": "wl",
    "Wells": "wls",
    "Wye": "wye"
  }

const app = express()
const port = 3000

const hlrToken = ''
const hlrSecret = ''
const basic = crypto.createHash('sha256').update(hlrToken + ':' + hlrSecret).digest('hex');

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;

let handledCharges: string[] = []

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())



const fs = require('fs')


// const mapTemplate = fs.readFileSync('templates/pages/map.html', 'utf-8')
const indexTemplate = fs.readFileSync('templates/pages/home.mustache', 'utf-8')
const recordByIdTemplate = fs.readFileSync('templates/pages/recordById.mustache', 'utf-8')
const recordsListingTemplate = fs.readFileSync('templates/pages/recordsListing.mustache', 'utf-8')
const exportsTemplate = fs.readFileSync('templates/pages/exports.html', 'utf-8')
const loginTemplate = fs.readFileSync('templates/pages/login.mustache', 'utf-8')
const adminTemplate = fs.readFileSync('templates/pages/admin.mustache', 'utf-8')
const changePasswordTemplate = fs.readFileSync('templates/pages/changePassword.mustache', 'utf-8')



const visualizerTemplate = fs.readFileSync('templates/pages/visualizer.html', 'utf-8')


const servers = ["http://solr1:8983/solr/BigData/select"]


const blacklistedAutomatedIps: string[] = []
const whitelistedUserAgents: string[] = [
    // API Keys
]

// Stores that last time a query was made to a server for an IP address
const lastQueryTime: Record<string, number> = {}
const lastQueryTimes: Record<string, number[]> = {}
const numLookupsPerIP: Record<string, number> = {}

function getRandServer() {
    var index = Math.floor(Math.random() * servers.length);
    return servers[index];
}



async function queryForDocsSpatial(latLong: string, distanceKm: number) {
    const records: SolrRecord[] = []
    let numDocs = 0

    await axios.get(getRandServer(), {
        params: {
            q: "latLong:*",
            rows: 500,
            fq: "{!geofilt sfield=latLong}",
            pt: latLong,
            d: distanceKm
        }
    }).then(({ data }) => {
        records.push(...data.response.docs)
        numDocs += data.response.numFound
    })

    console.log(`Spatial query for ${latLong} returned ${numDocs} records.`)

    return {
        numDocs: numDocs,
        records: records
    }
}

async function queryForDocs(query: string, limit?: number, start?: number, sort?: string) {
    const records: SolrRecord[] = []
    let numDocs = 0

    await axios.get(getRandServer(), {
        params: {
            q: query,
            rows: limit || 100,
            sort: sort,
            start: start || 0
        }
    }).then(({ data }) => {
        records.push(...data.response.docs)
        numDocs += data.response.numFound
    })


    return {
        numDocs: numDocs,
        records: records
    }
}

async function queryForExportDocs(query: string, limit?: number, start?: number, sort?: string) {
    const records: SolrRecord[] = []
    let numDocs = 0

    await axios.get(getRandServer().replace('BigData', 'Exports'), {
        params: {
            q: query,
            rows: limit || 100,
            sort: sort,
            start: start || 0
        }
    }).then(({ data }) => {
        records.push(...data.response.docs)
        numDocs += data.response.numFound
    })

    return {
        numDocs: numDocs,
        records: records
    }
}

function buildQuery(requestedQuery: Record<string, string | string[]>, res: express.Response) {
    let query: string[] = []
    let orQuery: string[] = []
    let notQuery: string[] = []
    let additionalQuery: string[] = []


    let doAdditionalQuery = false


    if (requestedQuery.firstName != undefined) {
        if (typeof requestedQuery.firstName == 'string') {
            query.push(`firstName:${requestedQuery.firstName.replace(' ', '?')}`)
        }
    }
    if (requestedQuery.notfirstName != undefined) {
        if (typeof requestedQuery.notfirstName === 'string') {
            notQuery.push(`firstName:${requestedQuery.notfirstName.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notfirstName)) {
            requestedQuery.notfirstName.forEach((notItem: any) => {
                notQuery.push(`firstName:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.lastName != undefined) {
        if (typeof requestedQuery.lastName == 'string') {
            query.push(`lastName:${requestedQuery.lastName.replace(' ', '?')}`)
        }
    }
    if (requestedQuery.notlastName != undefined) {
        if (typeof requestedQuery.notlastName === 'string') {
            notQuery.push(`lastName:${requestedQuery.notlastName.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notlastName)) {
            requestedQuery.notlastName.forEach((notItem: any) => {
                notQuery.push(`lastName:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.birthYear != undefined) {
        if (typeof requestedQuery.birthYear == 'string') {
            query.push(`birthYear:${requestedQuery.birthYear}`)
        }
    }
    if (requestedQuery.notbirthYear != undefined) {
        if (typeof requestedQuery.notbirthYear === 'string') {
            notQuery.push(`birthYear:${requestedQuery.notbirthYear.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notbirthYear)) {
            requestedQuery.notbirthYear.forEach((notItem: any) => {
                notQuery.push(`birthYear:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.ips != undefined) {
        if (typeof requestedQuery.ips == 'string') {
            query.push(`ips:WRfKdFVogXnk82${requestedQuery.ips}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notips != undefined) {
        if (typeof requestedQuery.notips === 'string') {
            notQuery.push(`ips:WRfKdFVogXnk82${requestedQuery.notips}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notips)) {
            requestedQuery.notips.forEach((notItem: any) => {
                notQuery.push(`ips:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.asn != undefined) {
        if (typeof requestedQuery.asn == 'string') {
            query.push(`asn:${requestedQuery.asn}`)
        }
    }
    if (requestedQuery.notasn != undefined) {
        if (typeof requestedQuery.notasn === 'string') {
            notQuery.push(`asn:${requestedQuery.notasn.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notasn)) {
            requestedQuery.notasn.forEach((notItem: any) => {
                notQuery.push(`asn:${notItem.replace(' ', '?')}`)
            })
        }
    }

    if (requestedQuery.domain != undefined) {
        if (requestedQuery.exact) {
            if (typeof requestedQuery.domain == 'string') {
                query.push(`domain:WRfKdFVogXnk82${requestedQuery.domain.replace(' ', '?')}WRfKdFVogXnk82`)
            }
        } else {
            if (typeof requestedQuery.domain == 'string') {
                query.push(`domain:${requestedQuery.domain.replace(' ', '?')}`)
            }
        }

    }
    if (requestedQuery.notdomain != undefined) {
        if (typeof requestedQuery.notdomain === 'string') {
            notQuery.push(`domain:WRfKdFVogXnk82${requestedQuery.notdomain.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notdomain)) {
            requestedQuery.notdomain.forEach((notItem: any) => {
                notQuery.push(`domain:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }


    if (requestedQuery.asnOrg != undefined) {
        if (typeof requestedQuery.asnOrg == 'string') {
            query.push(`asnOrg:WRfKdFVogXnk82${requestedQuery.asnOrg}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notasnOrg != undefined) {
        if (typeof requestedQuery.notasnOrg === 'string') {
            notQuery.push(`asnOrg:${requestedQuery.notasnOrg.replace(' ', '?')}`)
        } else if (Array.isArray(requestedQuery.notasnOrg)) {
            requestedQuery.notasnOrg.forEach((notItem: any) => {
                notQuery.push(`asnOrg:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.country != undefined) {
        if (typeof requestedQuery.country == 'string') {
            query.push(`country:WRfKdFVogXnk82${requestedQuery.country}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notcountry != undefined) {
        if (typeof requestedQuery.notcountry === 'string') {
            notQuery.push(`country:WRfKdFVogXnk82${requestedQuery.notcountry.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notcountry)) {
            requestedQuery.notcountry.forEach((notItem: any) => {
                notQuery.push(`country:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.continent != undefined) {
        if (typeof requestedQuery.continent == 'string') {
            query.push(`continent:WRfKdFVogXnk82${requestedQuery.continent}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notcontinent != undefined) {
        if (typeof requestedQuery.notcontinent === 'string') {
            notQuery.push(`continent:WRfKdFVogXnk82${requestedQuery.notcontinent.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notcontinent)) {
            requestedQuery.notcontinent.forEach((notItem: any) => {
                notQuery.push(`continent:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }



    if (requestedQuery.firstName != undefined && requestedQuery.lastName != undefined && typeof requestedQuery.firstName == 'string' && typeof requestedQuery.lastName == 'string') {
        const firstName = requestedQuery.firstName.replace(' ', '?')
        const lastName = requestedQuery.lastName.replace(' ', '?')

        if (!requestedQuery.exact) {
            additionalQuery.push(`emails:${firstName}?${lastName}`)
            doAdditionalQuery = true
        }
    }

    if (requestedQuery.source != undefined) {
        if (typeof requestedQuery.source == 'string') {
            query.push(`source:WRfKdFVogXnk82${requestedQuery.source}WRfKdFVogXnk82`)
        }
    }
    if (requestedQuery.notsource != undefined) {
        if (typeof requestedQuery.notsource === 'string') {
            notQuery.push(`source:WRfKdFVogXnk82${requestedQuery.notsource.replace(' ', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notsource)) {
            requestedQuery.notsource.forEach((notItem: any) => {
                notQuery.push(`source:WRfKdFVogXnk82${notItem.replace(' ', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.emails != undefined) {
        if (typeof requestedQuery.emails == 'string') {

            // check if there's a * in the email
            if (requestedQuery.emails.indexOf('*') != -1) {
                query.push(`emails:${requestedQuery.emails.replace('@', '?')}`)
            }
            else {
                if (requestedQuery.exact) {
                    query.push(`emails:WRfKdFVogXnk82${requestedQuery.emails.replace('@', '?')}WRfKdFVogXnk82`)
                } else {
                    query.push(`emails:${requestedQuery.emails.replace('@', '?')}`)
                }

            }


            const mostCommonEmailDomains = [/\@gmail\..*/gi, /\@yahoo\..*/gi, /\@hotmail\..*/gi, /\@outlook\..*/gi, /\@aol\..*/gi, /\@icloud\..*/gi, /\@mail\..*/gi, /\@protonmail\..*/gi, /\@zoho\..*/gi, /\@msn\..*/gi, /\@yandex\..*/gi, /\@gmx\..*/gi, /\@live\..*/gi, /\@mail\.ru\..*/gi, /\@inbox\..*/gi, /\@ymail\..*/gi, /\@comcast\..*/gi, /\@verizon\..*/gi, /\@att\..*/gi, /\@sbcglobal\..*/gi, /\@cox\..*/gi, /\@earthlink\..*/gi, /\@charter\..*/gi, /\@optonline\..*/gi, /\@frontier\..*/gi, /\@windstream\..*/gi, /\@q\.com\..*/gi, /\@btinternet\..*/gi, /\@btconnect\..*/gi, /\@ntlworld\..*/gi, /\@bt\..*/gi, /\@virginmedia\..*/gi, /\@btopenworld\..*/gi, /\@talktalk\..*/gi, /\@sky\..*/gi, /\@orange\..*/gi, /\@bt\..*/gi, /\@virgin\..*/gi, /\@ntl\..*/gi, /\@freeserve\..*/gi, /\@blueyonder\..*/gi, /\@btinternet\..*/gi, /\@tiscali\..*/gi, /\@virgin\..*/gi, /\@tesco\..*/gi, /\@onetel\..*/gi, /\@bt\..*/gi, /\@virgin\..*/gi, /\@ntl\..*/gi, /\@freeserve\..*/gi, /\@blueyonder\..*/gi, /\@btinternet\..*/gi, /\@tiscali\..*/gi, /\@virgin\..*/gi, /\@tesco\..*/gi, /\@onetel\..*/gi, /\@bt\..*/gi, /\@virgin\..*/]
            const emailSplit = requestedQuery.emails.split('@')

            if (requestedQuery.emails.indexOf('*') == -1) {
                additionalQuery.push(`emails:WRfKdFVogXnk82${emailSplit[0]}WRfKdFVogXnk82`)
            }


            doAdditionalQuery = true;

            let isCommonDomain = false;

            for (const domain of mostCommonEmailDomains) {
                if (domain.test(requestedQuery.emails as string)) {
                    isCommonDomain = true
                }
            }

            if (!isCommonDomain) {
                if (emailSplit.length === 2) {
                    const domain = emailSplit[emailSplit.length - 1]
                    additionalQuery.push(`emails:${domain}`)
                    doAdditionalQuery = true
                }
            }
        }
    }

    if (requestedQuery.notemails != undefined) {
        if (typeof requestedQuery.notemails === 'string') {
            notQuery.push(`emails:WRfKdFVogXnk82${requestedQuery.notemails.replace('@', '?')}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notemails)) {
            requestedQuery.notemails.forEach((notItem: any) => {
                notQuery.push(`emails:WRfKdFVogXnk82${notItem.replace('@', '?')}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.VRN != undefined) {
        if (typeof requestedQuery.VRN == 'string') {
            query.push(`VRN:${requestedQuery.VRN.toLowerCase()}`)
        }
    }
    if (requestedQuery.notVRN != undefined) {
        if (typeof requestedQuery.notVRN === 'string') {
            notQuery.push(`VRN:${requestedQuery.notVRN.toLowerCase()}`)
        } else if (Array.isArray(requestedQuery.notVRN)) {
            requestedQuery.notVRN.forEach((notItem: any) => {
                notQuery.push(`VRN:${notItem.toLowerCase()}`)
            })
        }
    }

    if (requestedQuery.usernames != undefined) {
        if (requestedQuery.exact) {
            query.push(`usernames:WRfKdFVogXnk82${requestedQuery.usernames}WRfKdFVogXnk82`)
        } else {
            query.push(`usernames:${requestedQuery.usernames}`)
        }
    }

    if (requestedQuery.notusernames != undefined) {
        if (typeof requestedQuery.notusernames === 'string') {
            notQuery.push(`usernames:${requestedQuery.notusernames}`)
        } else if (Array.isArray(requestedQuery.notusernames)) {
            requestedQuery.notusernames.forEach((notItem: any) => {
                notQuery.push(`usernames:${notItem.toLowerCase()}`)
            })
        }
    }


    if (requestedQuery.address != undefined) {
        query.push(`address:WRfKdFVogXnk82${requestedQuery.address}WRfKdFVogXnk82`)
    }
    if (requestedQuery.notaddress != undefined) {
        if (typeof requestedQuery.notaddress === 'string') {
            notQuery.push(`address:WRfKdFVogXnk82${requestedQuery.notaddress}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notaddress)) {
            requestedQuery.notaddress.forEach((notItem: any) => {
                notQuery.push(`address:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.city != undefined) {
        query.push(`city:${requestedQuery.city}`)
    }

    if (requestedQuery.notcity != undefined) {
        if (typeof requestedQuery.notcity === 'string') {
            notQuery.push(`city:WRfKdFVogXnk82${requestedQuery.notcity}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notcity)) {
            requestedQuery.notcity.forEach((notItem: any) => {
                notQuery.push(`city:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.zipCode != undefined) {
        query.push(`zipCode:${requestedQuery.zipCode}`)
    }
    if (requestedQuery.notzipCode != undefined) {
        if (typeof requestedQuery.notzipCode === 'string') {
            notQuery.push(`address:WRfKdFVogXnk82${requestedQuery.notzipCode}WRfKdFVogXnk82`)
        } else if (Array.isArray(requestedQuery.notzipCode)) {
            requestedQuery.notzipCode.forEach((notItem: any) => {
                notQuery.push(`address:WRfKdFVogXnk82${notItem}WRfKdFVogXnk82`)
            })
        }
    }

    if (requestedQuery.state != undefined) {
        query.push(`state:${requestedQuery.state}`)
    }
    if (requestedQuery.notstate != undefined) {
        if (typeof requestedQuery.notstate === 'string') {
            notQuery.push(`state:${requestedQuery.notstate}`)
        } else if (Array.isArray(requestedQuery.notstate)) {
            requestedQuery.notstate.forEach((notItem: any) => {
                notQuery.push(`state:${notItem}`)
            })
        }
    }


    if (requestedQuery.phoneNumbers != undefined && typeof requestedQuery.phoneNumbers == 'string') {

        if (!requestedQuery.exact) {
            query.push(`phoneNumbers:WRfKdFVogXnk82${requestedQuery.phoneNumbers.replace(/\D+/g, "")}WRfKdFVogXnk82`)
        } else {
            // Replace all non-digits or non-question marks with 
            query.push(`phoneNumbers:WRfKdFVogXnk82${requestedQuery.phoneNumbers.replace(/\D+/g, "")}WRfKdFVogXnk82`)
            additionalQuery.push(`phoneNumbers:1${requestedQuery.phoneNumbers.replace(/\D+/g, "")}`)
            additionalQuery.push(`phoneNumbers:7${requestedQuery.phoneNumbers.replace(/\D+/g, "")}`)
            doAdditionalQuery = true;
        }

    }

    if (requestedQuery.notphoneNumbers != undefined) {
        if (typeof requestedQuery.notphoneNumbers === 'string') {
            notQuery.push(`phoneNumbers:${requestedQuery.notphoneNumbers}`)
        } else if (Array.isArray(requestedQuery.notphoneNumbers)) {
            requestedQuery.notphoneNumbers.forEach((notItem: any) => {
                notQuery.push(`phoneNumbers:${notItem}`)
            })
        }
    }

    if (requestedQuery.passwords != undefined && typeof requestedQuery.passwords === 'string') {
        query.push(`passwords:${requestedQuery.passwords}`)
    } else if (requestedQuery.passwords != undefined && Array.isArray(requestedQuery.passwords)) {
        requestedQuery.passwords.forEach((password) => {
            orQuery.push(`passwords:WRfKdFVogXnk82${password}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notpasswords != undefined) {
        if (typeof requestedQuery.notpasswords === 'string') {
            notQuery.push(`passwords:${requestedQuery.notpasswords}`)
        } else if (Array.isArray(requestedQuery.notpasswords)) {
            requestedQuery.notpasswords.forEach((notItem: any) => {
                notQuery.push(`passwords:${notItem}`)
            })
        }
    }

    if (requestedQuery.vin != undefined && typeof requestedQuery.vin === 'string') {
        query.push(`vin:${requestedQuery.vin}`)
    } else if (requestedQuery.vin != undefined && Array.isArray(requestedQuery.vin)) {
        requestedQuery.vin.forEach((vin) => {
            orQuery.push(`vin:WRfKdFVogXnk82${vin}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.ssn != undefined && typeof requestedQuery.ssn === 'string') {
        query.push(`ssn:${requestedQuery.ssn}`)
    } else if (requestedQuery.ssn != undefined && Array.isArray(requestedQuery.ssn)) {
        requestedQuery.ssn.forEach((ssn) => {
            orQuery.push(`ssn:WRfKdFVogXnk82${ssn}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notssn != undefined && typeof requestedQuery.notssn === 'string') {
        notQuery.push(`ssn:${requestedQuery.notssn}`)
    } else if (requestedQuery.notssn != undefined && Array.isArray(requestedQuery.notssn)) {
        requestedQuery.notssn.forEach((notSSN) => {
            notQuery.push(`ssn:${notSSN}`)
        })
    }

    if (requestedQuery.licenseNumber != undefined && typeof requestedQuery.licenseNumber === 'string') {
        query.push(`licenseNumber:${requestedQuery.licenseNumber}`)
    } else if (requestedQuery.licenseNumber != undefined && Array.isArray(requestedQuery.licenseNumber)) {
        requestedQuery.licenseNumber.forEach((licenseNumber) => {
            orQuery.push(`licenseNumber:WRfKdFVogXnk82${licenseNumber}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notlicenseNumber != undefined && typeof requestedQuery.notlicenseNumber === 'string') {
        notQuery.push(`licenseNumber:${requestedQuery.notlicenseNumber}`)
    } else if (requestedQuery.notlicenseNumber != undefined && Array.isArray(requestedQuery.notlicenseNumber)) {
        requestedQuery.notlicenseNumber.forEach((notLicenseNumber) => {
            notQuery.push(`licenseNumber:${notLicenseNumber}`)
        })
    }

    // Regular query
    if (requestedQuery.debitNumber != undefined && typeof requestedQuery.debitNumber === 'string') {
        query.push(`debitNumber:${requestedQuery.debitNumber}`)
    } else if (requestedQuery.debitNumber != undefined && Array.isArray(requestedQuery.debitNumber)) {
        requestedQuery.debitNumber.forEach((debitNumber) => {
            orQuery.push(`debitNumber:WRfKdFVogXnk82${debitNumber}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notdebitNumber != undefined && typeof requestedQuery.notdebitNumber === 'string') {
        notQuery.push(`debitNumber:${requestedQuery.notdebitNumber}`)
    } else if (requestedQuery.notdebitNumber != undefined && Array.isArray(requestedQuery.notdebitNumber)) {
        requestedQuery.notdebitNumber.forEach((notDebitNumber) => {
            notQuery.push(`debitNumber:${notDebitNumber}`)
        })
    }

    if (requestedQuery.debitExpiration != undefined && typeof requestedQuery.debitExpiration === 'string') {
        query.push(`debitExpiration:${requestedQuery.debitExpiration}`)
    } else if (requestedQuery.debitExpiration != undefined && Array.isArray(requestedQuery.debitExpiration)) {
        requestedQuery.debitExpiration.forEach((debitExpiration) => {
            orQuery.push(`debitExpiration:WRfKdFVogXnk82${debitExpiration}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notdebitExpiration != undefined && typeof requestedQuery.notdebitExpiration === 'string') {
        notQuery.push(`debitExpiration:${requestedQuery.notdebitExpiration}`)
    } else if (requestedQuery.notdebitExpiration != undefined && Array.isArray(requestedQuery.notdebitExpiration)) {
        requestedQuery.notdebitExpiration.forEach((notDebitExpiration) => {
            notQuery.push(`debitExpiration:${notDebitExpiration}`)
        })
    }

    // Regular query
    if (requestedQuery.debitPin != undefined && typeof requestedQuery.debitPin === 'string') {
        query.push(`debitPin:${requestedQuery.debitPin}`)
    } else if (requestedQuery.debitPin != undefined && Array.isArray(requestedQuery.debitPin)) {
        requestedQuery.debitPin.forEach((debitPin) => {
            orQuery.push(`debitPin:WRfKdFVogXnk82${debitPin}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notdebitPin != undefined && typeof requestedQuery.notdebitPin === 'string') {
        notQuery.push(`debitPin:${requestedQuery.notdebitPin}`)
    } else if (requestedQuery.notdebitPin != undefined && Array.isArray(requestedQuery.notdebitPin)) {
        requestedQuery.notdebitPin.forEach((notDebitPin) => {
            notQuery.push(`debitPin:${notDebitPin}`)
        })
    }

    if (requestedQuery.creditNumber != undefined && typeof requestedQuery.creditNumber === 'string') {
        query.push(`creditNumber:${requestedQuery.creditNumber}`)
    } else if (requestedQuery.creditNumber != undefined && Array.isArray(requestedQuery.creditNumber)) {
        requestedQuery.creditNumber.forEach((creditNumber) => {
            orQuery.push(`creditNumber:WRfKdFVogXnk82${creditNumber}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notcreditNumber != undefined && typeof requestedQuery.notcreditNumber === 'string') {
        notQuery.push(`creditNumber:${requestedQuery.notcreditNumber}`)
    } else if (requestedQuery.notcreditNumber != undefined && Array.isArray(requestedQuery.notcreditNumber)) {
        requestedQuery.notcreditNumber.forEach((notCreditNumber) => {
            notQuery.push(`creditNumber:${notCreditNumber}`)
        })
    }

    if (requestedQuery.creditExpiration != undefined && typeof requestedQuery.creditExpiration === 'string') {
        query.push(`creditExpiration:${requestedQuery.creditExpiration}`)
    } else if (requestedQuery.creditExpiration != undefined && Array.isArray(requestedQuery.creditExpiration)) {
        requestedQuery.creditExpiration.forEach((creditExpiration) => {
            orQuery.push(`creditExpiration:WRfKdFVogXnk82${creditExpiration}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notcreditExpiration != undefined && typeof requestedQuery.notcreditExpiration === 'string') {
        notQuery.push(`creditExpiration:${requestedQuery.notcreditExpiration}`)
    } else if (requestedQuery.notcreditExpiration != undefined && Array.isArray(requestedQuery.notcreditExpiration)) {
        requestedQuery.notcreditExpiration.forEach((notCreditExpiration) => {
            notQuery.push(`creditExpiration:${notCreditExpiration}`)
        })
    }

    if (requestedQuery.passportNumber != undefined && typeof requestedQuery.passportNumber === 'string') {
        query.push(`passportNumber:${requestedQuery.passportNumber}`)
    } else if (requestedQuery.passportNumber != undefined && Array.isArray(requestedQuery.passportNumber)) {
        requestedQuery.passportNumber.forEach((passportNumber) => {
            orQuery.push(`passportNumber:WRfKdFVogXnk82${passportNumber}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notpassportNumber != undefined && typeof requestedQuery.notpassportNumber === 'string') {
        notQuery.push(`passportNumber:${requestedQuery.notpassportNumber}`)
    } else if (requestedQuery.notpassportNumber != undefined && Array.isArray(requestedQuery.notpassportNumber)) {
        requestedQuery.notpassportNumber.forEach((notPassportNumber) => {
            notQuery.push(`passportNumber:${notPassportNumber}`)
        })
    }

    if (requestedQuery.militaryID != undefined && typeof requestedQuery.militaryID === 'string') {
        query.push(`militaryID:${requestedQuery.militaryID}`)
    } else if (requestedQuery.militaryID != undefined && Array.isArray(requestedQuery.militaryID)) {
        requestedQuery.militaryID.forEach((militaryID) => {
            orQuery.push(`militaryID:WRfKdFVogXnk82${militaryID}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notmilitaryID != undefined && typeof requestedQuery.notmilitaryID === 'string') {
        notQuery.push(`militaryID:${requestedQuery.notmilitaryID}`)
    } else if (requestedQuery.notmilitaryID != undefined && Array.isArray(requestedQuery.notmilitaryID)) {
        requestedQuery.notmilitaryID.forEach((notMilitaryID) => {
            notQuery.push(`militaryID:${notMilitaryID}`)
        })
    }

    if (requestedQuery.bankAccountNumbers != undefined && typeof requestedQuery.bankAccountNumbers === 'string') {
        query.push(`bankAccountNumbers:${requestedQuery.bankAccountNumbers}`)
    } else if (requestedQuery.bankAccountNumbers != undefined && Array.isArray(requestedQuery.bankAccountNumbers)) {
        requestedQuery.bankAccountNumbers.forEach((bankAccountNumber) => {
            orQuery.push(`bankAccountNumbers:WRfKdFVogXnk82${bankAccountNumber}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notbankAccountNumbers != undefined && typeof requestedQuery.notbankAccountNumbers === 'string') {
        notQuery.push(`bankAccountNumbers:${requestedQuery.notbankAccountNumbers}`)
    } else if (requestedQuery.notbankAccountNumbers != undefined && Array.isArray(requestedQuery.notbankAccountNumbers)) {
        requestedQuery.notbankAccountNumbers.forEach((notBankAccountNumber) => {
            notQuery.push(`bankAccountNumbers:${notBankAccountNumber}`)
        })
    }

    if (requestedQuery.schoolsAttended != undefined && typeof requestedQuery.schoolsAttended === 'string') {
        query.push(`schoolsAttended:${requestedQuery.schoolsAttended}`)
    } else if (requestedQuery.schoolsAttended != undefined && Array.isArray(requestedQuery.schoolsAttended)) {
        requestedQuery.schoolsAttended.forEach((school) => {
            orQuery.push(`schoolsAttended:WRfKdFVogXnk82${school}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notschoolsAttended != undefined && typeof requestedQuery.notschoolsAttended === 'string') {
        notQuery.push(`schoolsAttended:${requestedQuery.notschoolsAttended}`)
    } else if (requestedQuery.notschoolsAttended != undefined && Array.isArray(requestedQuery.notschoolsAttended)) {
        requestedQuery.notschoolsAttended.forEach((notSchool) => {
            notQuery.push(`schoolsAttended:${notSchool}`)
        })
    }

    if (requestedQuery.certifications != undefined && typeof requestedQuery.certifications === 'string') {
        query.push(`certifications:${requestedQuery.certifications}`)
    } else if (requestedQuery.certifications != undefined && Array.isArray(requestedQuery.certifications)) {
        requestedQuery.certifications.forEach((certification) => {
            orQuery.push(`certifications:WRfKdFVogXnk82${certification}WRfKdFVogXnk82`)
        })
    }

    if (requestedQuery.notcertifications != undefined && typeof requestedQuery.notcertifications === 'string') {
        notQuery.push(`certifications:${requestedQuery.notcertifications}`)
    } else if (requestedQuery.notcertifications != undefined && Array.isArray(requestedQuery.notcertifications)) {
        requestedQuery.notcertifications.forEach((notCertification) => {
            notQuery.push(`certifications:${notCertification}`)
        })
    }







    let queryBuilt = sanitizeQuery(query.join(' AND '))

    if (orQuery.length > 0) {
        if (query.length > 0) {
            queryBuilt += ' OR ' + sanitizeQuery(orQuery.join(' OR '))
        } else {
            queryBuilt += sanitizeQuery(orQuery.join(' OR '))
        }
    }

    if (notQuery.length > 0) {
        if (query.length > 0) {
            queryBuilt += ' NOT ' + sanitizeQuery(notQuery.join(' NOT '))
        } else {
            return res.status(400).send("Error: you sent an negative query without a regular query! Silly goose.")
        }
    }

    return {
        query: queryBuilt,
        additionalQuery: additionalQuery,
        doAdditionalQuery: doAdditionalQuery
    }
}

async function getSimilarRecords(record: SolrRecord) {
    let responses: any[] = []

    const scoresList: Record<string, number> = {}

    const relatedDocIDs: string[] = []

    await Promise.all([
        ...(record.emails || []).map((email) => {
            return axios.get(getRandServer(), {
                params: {
                    q: `emails:"${email.replace(/\"/gi, '').replace(/\//gi, '')}"`,
                    rows: 20,
                    fl: 'id'
                }
            }).then(({ data }) => {
                data.response.docs.forEach((doc: SolrRecord) => {
                    if (doc.id === record.id) {
                        return
                    }
                    if (!(doc.id in scoresList)) {
                        scoresList[doc.id] = 15
                    } else {
                        scoresList[doc.id] += 5
                    }
                    relatedDocIDs.push(doc.id)
                })
            })
        }),
        ...(record.usernames || []).map((email) => {
            return axios.get(getRandServer(), {
                params: {
                    q: `usernames:"${email.replace(/\"/gi, '').replace(/\//gi, '')}"`,
                    rows: 20,
                    fl: 'id'
                }
            }).then(({ data }) => {
                data.response.docs.forEach((doc: SolrRecord) => {
                    if (doc.id === record.id) {
                        return
                    }
                    if (!(doc.id in scoresList)) {
                        scoresList[doc.id] = 15
                    } else {
                        scoresList[doc.id] += 5
                    }
                    relatedDocIDs.push(doc.id)
                })
            })
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'emails',
                'mlt.mindf': 2,
                'mlt.mintf': 2,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score

                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'usernames',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score

                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'phoneNumbers',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score

                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'address_search',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score

                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
        axios.get(getRandServer(), {
            params: {
                q: `id:${record.id}`,
                mlt: true,
                'mlt.fl': 'firstName,lastName',
                'mlt.mindf': 1,
                'mlt.mintf': 1,
                'mlt.match.include': true,
            }
        }).then(({ data }) => {
            data.moreLikeThis.forEach((doc: any) => {
                if (typeof doc == 'object') {
                    doc.docs.forEach((relatedDoc: any) => {
                        if (scoresList[relatedDoc.id]) {
                            scoresList[relatedDoc.id] += relatedDoc.score
                        } else {
                            scoresList[relatedDoc.id] = relatedDoc.score
                        }
                    })
                }
            })
            responses.push(...data.moreLikeThis)
        }),
    ])


    responses.forEach((response) => {
        if (typeof response == 'object') {
            relatedDocIDs.push(...(response.docs.map((doc: any) => doc.id)))
        }
    })

    let docs: SolrRecord[] = []

    // Get unique doc IDs
    const uniqueDocIDs = [...new Set(relatedDocIDs)]



    await Promise.all(uniqueDocIDs.map((doc: any) => queryForDocs(`id:${doc}`))).then((results) => {
        results.forEach((result) => {
            docs.push(...result.records.map((result) => {
                return {
                    ...result,
                    'similarity score': scoresList[result.id] || 0,
                }
            }))
        })
    })

    // Sort the docs by score
    docs = docs.sort((a, b) => {
        if (scoresList[a.id] > scoresList[b.id]) {
            return -1
        } else if (scoresList[a.id] < scoresList[b.id]) {
            return 1
        } else {
            return 0
        }
    })

    return docs
}

function sanitizeQuery(query: string) {
    //return query;
    return query.replace(/[^\w\s\$\:\.\@\-\*\а-яА-ЯёЁ]/gi, '?').replace(/WRfKdFVogXnk82/g, '"')
}

app.get('/exports', async (req, res) => {
    const rendered = mustache.render(exportsTemplate, {})
    return res.send(rendered)
})

app.get('/', async (req: Request, res: Response, next: NextFunction) => {
    const isLoggedIn = req.session && req.session.user; // Determine login status
    const rendered = mustache.render(indexTemplate, {
        count: "14,491,682,918",
        isLoggedIn: isLoggedIn
    });
    console.log("Is user logged in?", isLoggedIn); // Debug: Log login status
    return res.send(rendered);
});



app.get('/login', async (req, res) => {
    const rendered = mustache.render(loginTemplate, { error: null });
    return res.send(rendered);
});

app.get('/changepassword', async (req, res) => {
    const rendered = mustache.render(changePasswordTemplate, { error: null });
    return res.send(rendered);
});

app.get('/map', async (req, res) => {
    res.sendFile(__dirname + '/static/map.html')
})

app.get('/favicon.ico', (req, res) => {
    // Read the favicon file and send it to the client
    res.sendFile(__dirname + '/static/favicon.ico')
})

app.get('/robots.txt', (req, res) => {
    // Read robots.txt and send it to the client
    res.sendFile(__dirname + '/static/robots.txt')
})

app.get('/terms', (req, res) => {
    res.sendFile(__dirname + '/static/terms.html')
})

app.get('/faq', (req, res) => {
    res.sendFile(__dirname + '/static/faq.html')
})

app.get('/styles.css', (req, res) => {
    res.sendFile(__dirname + '/static/styles.css')
})

// app.get('/donations', (req, res) => {
//     // Render out the donations page tempate
//     const rendered = mustache.render(donationsTemplate, {
//         donations: donations.sort((a: any, b: any) => b.amount - a.amount)
//     })
//
//     return res.send(rendered)
// })

app.post('/export', async (req, res) => {
    try {
        // Read body
        let body = req.body


        // Make sure export count is > 0
        if (typeof body.exportCount !== 'number') {
            // Set it to be a number
            body.exportCount = parseInt(body.exportCount, 10)
        }
        if (body.exportCount <= 0) {
            return res.status(400).send('Invalid export count')
        }




        let requestedQuery: Record<string, any> = {}

        for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'wt') {
                if (typeof value === 'string' || Array.isArray(value)) {
                    requestedQuery[key] = value
                } else {
                    console.log(`Invalid query: ${key} is not a string or array. ${value}`)
                }
            }
        }

        const queryBuilt = buildQuery(requestedQuery, res as any) as any

        const jobid = uuidv4()

        if (!queryBuilt.query || !queryBuilt.additionalQuery || typeof queryBuilt.doAdditionalQuery !== 'boolean') {
            return res.status(400).send('Invalid query')
        }

        let finalQuery = queryBuilt.query

        if (queryBuilt.additionalQuery.length > 0) {
            finalQuery = `(${finalQuery}) OR ${sanitizeQuery(queryBuilt.additionalQuery.join(' OR '))}`
        }

        const payload = {
            "status": "started",
            "jobid": jobid,
            "query": finalQuery,
            "additionalQuery": queryBuilt.additionalQuery,
            "doAdditionalQuery": queryBuilt.doAdditionalQuery,
            "exportCount": body.exportCount,
            "success": true,
        }

        // Return to client that the job has been started
        res.json(payload)

        // End the response
        res.end()

        // Post to wallet DB
        await axios.post(getRandServer().replace('BigData', 'Exports').replace('select', 'update'), {
            "add": {
                "doc": {
                    // uuid v4
                    "id": payload.jobid,
                    "query": payload.query,
                    "status": payload.status,
                    'count': payload.exportCount,
                }
            }
        }, {
            params: {
                commit: true
            }
        })

        // Base64 encode payload
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64')

        // asyncronously run python3 exports/doExport.py <encodedPayload>
        const pythonProcess = spawn('python3', ['exports/doExport.py', encodedPayload])

        // Listen for data from the python process
        pythonProcess.stdout.on('data', (data) => {
            console.log(`Export Job ${jobid}: ${data}`);
        })

        // Listen for errors from the python process
        pythonProcess.stderr.on('data', (data) => {
            console.error(`Export Job ${jobid}: ${data}`);
        })
    } catch (e) {
        console.error(e)
        res.status(400).send('stoooop')
    }
})

app.post('/exports/callbacks/a-unique-id/exportCb', async (req, res) => {
    // Read body
    const body = req.body


    if (body.status === 'failed') {

    }

    // Post to db
    await axios.post(getRandServer().replace('BigData', 'Exports').replace('select', 'update'), {
        "add": {
            "doc": {
                // uuid v4
                "id": body.jobid,
                "query": body.query,
                "status": body.status,
                'count': body.exportCount,
                "link": body.link
            }
        }
    }, {
        params: {
            commit: true
        }
    })

    return res.status(200)
})



function isAutomated(req: any) {
    // Check if ip is in blacklist
    const connectingIp = req.headers['cf-connecting-ip'] || req.connection.remoteAddress;
    if (blacklistedAutomatedIps.includes(connectingIp)) {
        console.log(`BLACKLISTED IP ${connectingIp}`)
        return true
    }


    // Check if user agent has axios in it
    const userAgent = req.headers['user-agent']

    if (whitelistedUserAgents.some((whitelistedAgent) => userAgent.includes(whitelistedAgent))) {
        return false
    }

    if (userAgent != undefined) {
        if (typeof userAgent == 'string') {
            if (Object.keys(req.query).length === 1 && req.query.emails) {
                // Check if the user has gotten their wallet
                const connectingIp = req.headers['cf-connecting-ip']

                if (typeof connectingIp === 'string') {

                }
            }
        }
    }
    return false
}

async function checkIPAutomatedSTDDEV(req: any) {
    const ip = req.headers['cf-connecting-ip'] || req.connection.remoteAddress;

    const userAgent = req.headers['user-agent']

    if (whitelistedUserAgents.some((whitelistedAgent) => userAgent.includes(whitelistedAgent))) {
        return false
    }

    if (ip === '0.0.0.0' || !ip) {
        // Hello, KT :3c
        console.log('wat r u doin')
        return true
    } else if (typeof ip === 'string') {

        if (numLookupsPerIP[ip] === undefined) {
            numLookupsPerIP[ip] = 0
        }

        // If no last query time
        if (lastQueryTime[ip] === undefined) {
            lastQueryTime[ip] = Date.now()
            return false
        } else {
            // Get the time between the last query and now
            const timeSinceLastQuery = (Date.now() - lastQueryTime[ip])
            console.log(`Time since last query for ${ip}: ${timeSinceLastQuery}`)

            numLookupsPerIP[ip] += 1

            console.log(ip + ' has ' + numLookupsPerIP[ip] + ' lookups.')

            if (numLookupsPerIP[ip] > 200) {
                blacklistedAutomatedIps.push(ip)
                return true
            }


            // Add current request to lookup table
            if (lastQueryTimes[ip] === undefined) {
                lastQueryTimes[ip] = []
            }

            // If there's less than 40 values in the array, add the current time
            if (lastQueryTimes[ip].length < 40) {
                lastQueryTimes[ip].push(timeSinceLastQuery)
            }
            // If there's more than 40 values in the array, remove the first value and add the current time
            else if (lastQueryTimes[ip].length >= 40) {
                lastQueryTimes[ip].shift()
                lastQueryTimes[ip].push(timeSinceLastQuery)
            }

            // If there's more than 20 values in the array, calculate the standard deviation between the values
            if (lastQueryTimes[ip].length >= 20) {
                const standardDeviation = ss.standardDeviation(lastQueryTimes[ip])
                console.log(`Standard deviation for ${ip}: ${standardDeviation}`)
                // If the standard deviation is less than 1000, the user is probably a bot
                if (standardDeviation < 1800) {
                    console.log('erm haht the duence')
                    blacklistedAutomatedIps.push(ip)
                    return true
                }
            }

            // If all of the requests have less than 2000 ms of delay:
            if (lastQueryTimes[ip].length >= 20) {
                if (lastQueryTimes[ip].every((request) => request < 5000)) {
                    blacklistedAutomatedIps.push(ip)
                    return true
                }
            }


            lastQueryTime[ip] = Date.now()
            return false;
        }

    } else {
        console.log('erm haht the duence')
        return true
    }
    return false
}

async function doAutomatedRes(res: any, json?: boolean) {
    if (json) {
        return res.json({
            resultCount: 69420,
            count: 69420,
            records: [
                {
                    id: uuidv4(),
                    firstName: '[[EXTREMELY LOUD INCORRECT BUZZER]]',
                    lastName: 'Automated scraping detected. Please contact miyakoyakota@riseup.com to be whitelisted.',
                    email: 'This data comes from https://search.illicit.services and it is free to use. Do not pay for access to this data.',
                }
            ]
        })
    }
    else {

        const rendered = mustache.render(recordsListingTemplate, {
            resultCount: 69420,
            count: 69420,
            records: [
                {
                    id: uuidv4(),
                    firstName: '[[EXTREMELY LOUD INCORRECT BUZZER]]',
                    fields: [
                        "firstName: [[EXTREMELY LOUD INCORRECT BUZZER]]",
                        "lastName: Automated scraping detected. Please contact miyakoyakota@riseup.com to be whitelisted. If you would like to use this site as an API, you may add ?wt=json to return JSON.",
                        "email: This data comes from https://search.illicit.services and it is free to use. Do not pay for access to this data.",
                    ]
                }
            ]
        })

        return res.send(rendered)
    }


}

app.get('/documents/by_id/:id', async (req, res) => {
    if (isAutomated(req)) {
        return doAutomatedRes(res, req.query.wt === 'json')
    }

    if (await checkIPAutomatedSTDDEV(req)) {
        return doAutomatedRes(res, req.query.wt === 'json')
    }

    const records = await queryForDocs(`id:${req.params.id}`)
    const record = records.records[0]

    if (record === undefined) {
        return res.status(404).send('No record found.')
    }

    // If wt=json
    if (req.query.wt == 'json') {
        // check moreLikeThis 

        if (req.query.moreLikeThis == 'true') {
            const similarRecords = await getSimilarRecords(record).catch((err) => {
                console.log(err)
                return []
            })

            return res.json({
                record: record,
                related: similarRecords
            })
        } else {
            return res.json({
                record: record
            })
        }
    }

    const similarRecords = await getSimilarRecords(record).catch((err) => {
        return []
    })



    const rendered = mustache.render(recordByIdTemplate, {
        id: record.id,
        record: Object.entries(_.omit(record, ['id', '_version_'])).map(([key, value]) => {
            return {
                key: key,
                value: value
            }
        }),
        related: similarRecords.map((record) => {
            return {
                id: record.id,
                record: Object.entries(_.omit(record, ['id', '_version_'])).map(([key, value]) => {
                    return {
                        key: key,
                        value: value
                    }
                })
            }
        })
    })

    return res.send(rendered)
})

function makeid(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

app.get('/spatial', async (req, res) => {
    if (req.query.latLong != undefined && typeof req.query.latLong === 'string') {
        // Validate latLong using regex
        const latLongRegex = /^-?\d{1,3}(?:\.\d{1,20})?,-?\d{1,3}(?:\.\d{1,20})?$/;

        // Validate d within 0.1 and 1000
        if (typeof req.query.d !== 'string' && req.query.d !== undefined) {
            return res.send({
                error: true,
                errorMessage: 'Please provide a valid d between 0.1 and 1000'
            })
        }
        const d = parseFloat(req.query.d || '0.2')

        if (d < 0.1 || d > 1000) {
            return res.send({
                error: true,
                errorMessage: 'Please provide a valid d between 0.1 and 1000'
            })
        }

        if (latLongRegex.test(req.query.latLong)) {
            let recordsResponse = await queryForDocsSpatial(req.query.latLong, d).catch((err) => {
                return {
                    numDocs: 0,
                    records: [] as SolrRecord[]
                }
            })

            res.json(recordsResponse)

        } else {
            // latLong is not valid
            return res.send({
                error: true,
                errorMessage: 'Please only send coordinates as lat,long'
            })
        }
    } else {
        res.json({
            error: true,
            errorMessage: "Provide a latLong! Dumbo."
        })
    }
})

declare module 'express-session' {
    interface SessionData {
        user?: { id: string; username: string; role: string }; // Adjust according to your user object structure
    }
}

const usersFilePath = __dirname + '/users/users.json';
let users: any[] = []; // Consider defining a type for user objects

try {
    const usersData = fs.readFileSync(usersFilePath, 'utf-8');
    users = JSON.parse(usersData);
} catch (err) {
    console.error('Error reading users file:', err);
}

// Session middleware
app.use(session({
    secret: 'change-me-secret-key', // Change this to a secure secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set true if using https
}));

app.get('/login', (req: Request, res: Response) => {
    res.sendFile(loginTemplate)
});

app.post('/login', async (req: Request, res: Response) => {
    const { username, password } = req.body;


    const user = users.find((user) => user.username === username);
    if (!user) {
        const rendered = mustache.render(loginTemplate, { error: 'Invalid username or password' });
        return res.send(rendered);
    }
    try {
        if (await bcrypt.compare(password, user.password)) {
            req.session!.user = user; // Note the non-null assertion operator `!`
            return res.redirect('/');
        } else {
            const rendered = mustache.render(loginTemplate, { error: 'Invalid username or password' });
            return res.send(rendered);
        }
    } catch (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).send('Internal Server Error');
    }
});

app.get('/logout', (req: Request, res: Response) => {
    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Failed to destroy session during logout:', err);
            return res.status(500).send('Failed to log out.');
        }

        // Optionally, you can clear the client-side cookie here if you set one during login
        res.clearCookie('connect.sid'); // This depends on the name of your session cookie, adjust if different

        // Redirect to login page or home page after logout
        res.redirect('/');
    });
});

function requireLogin(req: Request, res: Response, next: NextFunction) {
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function checkUserRole(req: Request, roleToCheck: string): boolean {
    return req.session?.user?.role === roleToCheck || false;
}

app.get('/admin', requireLogin, (req, res) => {
    if (checkUserRole(req, 'admin')) {
        const rendered = mustache.render(adminTemplate, {
            message: "Welcome to the Admin Dashboard",
        });
        res.send(rendered);
    } else {
        res.status(403).send("Access denied: You do not have admin privileges.");
    }
});

app.post('/changepassword', async (req: Request, res: Response) => {
    // Use optional chaining to safely access user object
    if (!req.session?.user) {
        return res.redirect('/login');
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        const rendered = mustache.render(changePasswordTemplate, { error: "New passwords do not match." });
        return res.send(rendered);
    }

    // Continue to use optional chaining to ensure user object is not undefined
    const user = users.find(u => u.username === req.session?.user?.username);
    if (!user) {
        return res.status(404).send("User not found.");
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
        const rendered = mustache.render(changePasswordTemplate, { error: "Current password is incorrect." });
        return res.send(rendered);
    }

    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    // Save the updated user details
    fs.writeFileSync(usersFilePath, JSON.stringify(users), 'utf8');

    res.send("Password successfully changed.");
});




app.get('/records', requireLogin, async (req, res) => {
    try {
        const userAgent = req.headers['user-agent']

        if (!(userAgent === 'yeayeyayaeyayeayeyaeyeayyaeyeyaeyae')) {
            if (isAutomated(req)) {
                return doAutomatedRes(res, req.query.wt === 'json')
            }
        }


        if (req.query.wt === 'json') {
            // Check if the user-agent is in the list of allowed user-agents
            const apiKey = req.query.apikey || req.headers['user-agent']

            if (typeof apiKey === 'string') {
                if (whitelistedUserAgents.includes(apiKey)) {
                    // User agent is allowed
                    // Continue
                } else {
                    console.log(`IP ${req.headers['cf-connecting-ip'] || req.connection.remoteAddress} tried to access the API with user-agent ${apiKey}`)
                    // User agent is not allowed
                    res.status(403)
                    return res.json({
                        error: true,
                        message: 'API Access requires a free API token. Please contact miyakoyakota@riseup.com to get one.'
                    })
                }
            } else {
                return res.json({ error: true, message: 'API Access requires a free API token. Please contact miyakoyakota@riseup.com to get one.' })
            }
        }

        let requestedQuery: Record<string, any> = {}

        for (const [key, value] of Object.entries(req.query)) {
            if (key !== 'wt') {
                if (typeof value === 'string' || Array.isArray(value)) {
                    requestedQuery[key] = value
                } else {
                    console.log(`Invalid query: ${key} is not a string or array. ${value}`)
                }
            }
        }

        const queryBuilt = buildQuery(requestedQuery, res as any) as any

        if (!Boolean(queryBuilt.query)) {
            return res.status(400).send('no query!!!')
        }

        // Check if type is express.Response
        if (queryBuilt === undefined) {
            return res.status(400).send('no query!!!')
        }

        if (!queryBuilt.query || !queryBuilt.additionalQuery || typeof queryBuilt.doAdditionalQuery !== 'boolean') {
            return res.status(400).send('no query!!!')
        }

        let totalRecordCount = 0
        let recordsResponse: any = null

        recordsResponse = await queryForDocs(queryBuilt.query).catch((err) => {
            console.log(err)
            return {
                numDocs: 0,
                records: [] as SolrRecord[]
            }
        })

        totalRecordCount += recordsResponse.numDocs

        let records = recordsResponse.records

        if (queryBuilt.doAdditionalQuery && !req.query.exact && req.query.exact != 'true' && req.query.exact != '1' && req.query.exact != 'yes' && req.query.exact != 'y' && req.query.exact != 'on' && req.query.exact != 't' && req.query.exact != 'sure' && req.query.exact != 'please' && req.query.exact != 'True') {
            const additionalQueryBuilt = sanitizeQuery(queryBuilt.additionalQuery.join(' OR '))

            let additionalRecordsResponse: any = null

            if (typeof req.query.sofreshandsoclean === 'string') {
                additionalRecordsResponse = await queryForDocs(additionalQueryBuilt, 10000).catch((err) => {
                    return {
                        numDocs: 0,
                        records: [] as SolrRecord[]
                    }
                })
            } else {
                additionalRecordsResponse = await queryForDocs(additionalQueryBuilt).catch((err) => {
                    return {
                        numDocs: 0,
                        records: [] as SolrRecord[]
                    }
                })
            }

            totalRecordCount += additionalRecordsResponse.numDocs

            const additionalRecords = additionalRecordsResponse.records

            records.push(...additionalRecords)
        }

        let recordsFinal = records.map((record: any) => {
            return {
                ...record,
                canMap: Boolean(record.address) || Boolean(record.latLong),
                fields: Object.keys(_.omit(record, ['id', '_version_'])).map((key) => {
                    return `${key}: ${(record as any)[key]}`
                })
            }
        })

        // Remove duplicates
        recordsFinal = _.uniqBy(recordsFinal, 'id')

        // If wt=json is set return as json
        if (req.query.wt == 'json') {
            return res.json({
                resultCount: totalRecordCount,
                count: records.length,
                records: recordsFinal
            })
        } else {
            const rendered = mustache.render(recordsListingTemplate, {
                resultCount: totalRecordCount,
                count: records.length,
                records: recordsFinal,
                finalquery: queryBuilt.query
            })

            return res.send(rendered)
        }
    } catch (e) {
        res.status(500)
    }
})

app.listen(port, '0.0.0.0', () => {
    console.log(`Example app listening on port ${port}`)
}) 
