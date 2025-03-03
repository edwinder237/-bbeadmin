export type ClientPreferences = {
  locationFilter: boolean
  lodgifyWsUrl: string
  lodgifyWsId: string
  headingFont: string
  bodyFont: string
  fontLink: string
  currencies: string[]
  imgLink: string
  primaryColor: string
  secondaryColor: string
  bookingFooterColor: string
  buttonFontColorOnHover: string
  customDomain: string
  wixCmsUrl: string
  maxGuests: number
  language: string
  integrationLabel: string
}

export type ClientData = {
  status: "Production"| "Inactive" | "Development" | "Testing"
  accessKey: string
  name: string
  email: string
  ApiKey?: string
  clientID?: string
  clientSecret?: string
  integrationId: string
  preferences: ClientPreferences
}