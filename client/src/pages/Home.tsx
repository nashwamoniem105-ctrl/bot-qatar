import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from "wouter";
import { useTranslation } from "@/hooks/useTranslation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { nanoid } from "nanoid";

const COUNTRIES = [
  {"id": "QAT", "ar": "قطر", "en": "Qatar"},
  {"id": "SAU", "ar": "المملكة العربية السعودية", "en": "Saudi Arabia"},
  {"id": "ARE", "ar": "الإمارات العربية المتحدة", "en": "United Arab Emirates"},
  {"id": "KWT", "ar": "الكويت", "en": "Kuwait"},
  {"id": "BHR", "ar": "البحرين", "en": "Bahrain"},
  {"id": "OMN", "ar": "عمان", "en": "Oman"},
  {"id": "EGY", "ar": "مصر", "en": "Egypt"},
  {"id": "JOR", "ar": "الأردن", "en": "Jordan"},
  {"id": "PSE", "ar": "فلسطين", "en": "Palestine"},
  {"id": "IRQ", "ar": "العراق", "en": "Iraq"},
  {"id": "LBN", "ar": "لبنان", "en": "Lebanon"},
  {"id": "SYR", "ar": "سوريا", "en": "Syria"},
  {"id": "YEM", "ar": "اليمن", "en": "Yemen"},
  {"id": "LBY", "ar": "ليبيا", "en": "Libya"},
  {"id": "SDN", "ar": "السودان", "en": "Sudan"},
  {"id": "MAR", "ar": "المغرب", "en": "Morocco"},
  {"id": "DZA", "ar": "الجزائر", "en": "Algeria"},
  {"id": "TUN", "ar": "تونس", "en": "Tunisia"},
  {"id": "MRT", "ar": "موريتانيا", "en": "Mauritania"},
  {"id": "SOM", "ar": "الصومال", "en": "Somalia"},
  {"id": "DJI", "ar": "جيبوتي", "en": "Djibouti"},
  {"id": "COM", "ar": "جزر القمر", "en": "Comoros"},
  {"id": "AFG", "ar": "أفغانستان", "en": "Afghanistan"},
  {"id": "ALB", "ar": "ألبانيا", "en": "Albania"},
  {"id": "ASM", "ar": "ساموا الأمريكية", "en": "American Samoa"},
  {"id": "AND", "ar": "أندورا", "en": "Andorra"},
  {"id": "AGO", "ar": "أنغولا", "en": "Angola"},
  {"id": "AIA", "ar": "أنغويلا", "en": "Anguilla"},
  {"id": "ATA", "ar": "أنتاركتيكا", "en": "Antarctica"},
  {"id": "ATG", "ar": "أنتيغوا وبربودا", "en": "Antigua and Barbuda"},
  {"id": "ARG", "ar": "الأرجنتين", "en": "Argentina"},
  {"id": "ARM", "ar": "أرمينيا", "en": "Armenia"},
  {"id": "ABW", "ar": "أروبا", "en": "Aruba"},
  {"id": "AUS", "ar": "أستراليا", "en": "Australia"},
  {"id": "AUT", "ar": "النمسا", "en": "Austria"},
  {"id": "AZE", "ar": "أذربيجان", "en": "Azerbaijan"},
  {"id": "BHS", "ar": "جزر البهاما", "en": "Bahamas"},
  {"id": "BGD", "ar": "بنغلاديش", "en": "Bangladesh"},
  {"id": "BRB", "ar": "باربادوس", "en": "Barbados"},
  {"id": "BLR", "ar": "بيلاروسيا", "en": "Belarus"},
  {"id": "BEL", "ar": "بلجيكا", "en": "Belgium"},
  {"id": "BLZ", "ar": "بليز", "en": "Belize"},
  {"id": "BEN", "ar": "بنين", "en": "Benin"},
  {"id": "BMU", "ar": "برمودا", "en": "Bermuda"},
  {"id": "BTN", "ar": "بوتان", "en": "Bhutan"},
  {"id": "BOL", "ar": "بوليفيا", "en": "Bolivia"},
  {"id": "BES", "ar": "بونير وسينت أوستاتيوس وسابا", "en": "Bonaire, Sint Eustatius and Saba"},
  {"id": "BIH", "ar": "البوسنة والهرسك", "en": "Bosnia and Herzegovina"},
  {"id": "BWA", "ar": "بوتسوانا", "en": "Botswana"},
  {"id": "BVT", "ar": "جزيرة بوفيه", "en": "Bouvet Island"},
  {"id": "BRA", "ar": "البرازيل", "en": "Brazil"},
  {"id": "IOT", "ar": "إقليم المحيط الهندي البريطاني", "en": "British Indian Ocean Territory"},
  {"id": "BRN", "ar": "بروناي دار السلام", "en": "Brunei Darussalam"},
  {"id": "BGR", "ar": "بلغاريا", "en": "Bulgaria"},
  {"id": "BFA", "ar": "بوركينا فاسو", "en": "Burkina Faso"},
  {"id": "BDI", "ar": "بوروندي", "en": "Burundi"},
  {"id": "CPV", "ar": "كابو فيردي", "en": "Cabo Verde"},
  {"id": "KHM", "ar": "كمبوديا", "en": "Cambodia"},
  {"id": "CMR", "ar": "الكاميرون", "en": "Cameroon"},
  {"id": "CAN", "ar": "كندا", "en": "Canada"},
  {"id": "CYM", "ar": "جزر كايمان", "en": "Cayman Islands"},
  {"id": "CAF", "ar": "جمهورية أفريقيا الوسطى", "en": "Central African Republic"},
  {"id": "TCD", "ar": "تشاد", "en": "Chad"},
  {"id": "CHL", "ar": "تشيلي", "en": "Chile"},
  {"id": "CHN", "ar": "الصين", "en": "China"},
  {"id": "CXR", "ar": "جزيرة عيد الميلاد", "en": "Christmas Island"},
  {"id": "CCK", "ar": "جزر كوكوس (كيلينغ)", "en": "Cocos (Keeling) Islands"},
  {"id": "COL", "ar": "كولومبيا", "en": "Colombia"},
  {"id": "COG", "ar": "الكونغو", "en": "Congo"},
  {"id": "COD", "ar": "جمهورية الكونغو الديمقراطية", "en": "Congo, Democratic Republic of the"},
  {"id": "COK", "ar": "جزر كوك", "en": "Cook Islands"},
  {"id": "CRI", "ar": "كوستاريكا", "en": "Costa Rica"},
  {"id": "CIV", "ar": "كوت ديفوار", "en": "Côte d'Ivoire"},
  {"id": "HRV", "ar": "كرواتيا", "en": "Croatia"},
  {"id": "CUB", "ar": "كوبا", "en": "Cuba"},
  {"id": "CUW", "ar": "كوراساو", "en": "Curaçao"},
  {"id": "CYP", "ar": "قبرص", "en": "Cyprus"},
  {"id": "CZE", "ar": "جمهورية التشيك", "en": "Czechia"},
  {"id": "DNK", "ar": "الدنمارك", "en": "Denmark"},
  {"id": "DMA", "ar": "دومينيكا", "en": "Dominica"},
  {"id": "DOM", "ar": "جمهورية الدومينيكان", "en": "Dominican Republic"},
  {"id": "ECU", "ar": "الإكوادور", "en": "Ecuador"},
  {"id": "SLV", "ar": "السلفادور", "en": "El Salvador"},
  {"id": "GNQ", "ar": "غينيا الاستوائية", "en": "Equatorial Guinea"},
  {"id": "ERI", "ar": "إريتريا", "en": "Eritrea"},
  {"id": "EST", "ar": "إستونيا", "en": "Estonia"},
  {"id": "SWZ", "ar": "إسواتيني", "en": "Eswatini"},
  {"id": "ETH", "ar": "إثيوبيا", "en": "Ethiopia"},
  {"id": "FLK", "ar": "جزر فوكلاند (مالفيناس)", "en": "Falkland Islands (Malvinas)"},
  {"id": "FRO", "ar": "جزر فارو", "en": "Faroe Islands"},
  {"id": "FJI", "ar": "فيجي", "en": "Fiji"},
  {"id": "FIN", "ar": "فنلندا", "en": "Finland"},
  {"id": "FRA", "ar": "فرنسا", "en": "France"},
  {"id": "GUF", "ar": "غويانا الفرنسية", "en": "French Guiana"},
  {"id": "PYF", "ar": "بولينيزيا الفرنسية", "en": "French Polynesia"},
  {"id": "ATF", "ar": "المقاطعات الجنوبية الفرنسية", "en": "French Southern Territories"},
  {"id": "GAB", "ar": "الغابون", "en": "Gabon"},
  {"id": "GMB", "ar": "غامبيا", "en": "Gambia"},
  {"id": "GEO", "ar": "جورجيا", "en": "Georgia"},
  {"id": "DEU", "ar": "ألمانيا", "en": "Germany"},
  {"id": "GHA", "ar": "غانا", "en": "Ghana"},
  {"id": "GIB", "ar": "جبل طارق", "en": "Gibraltar"},
  {"id": "GRC", "ar": "اليونان", "en": "Greece"},
  {"id": "GRL", "ar": "جرينلاند", "en": "Greenland"},
  {"id": "GRD", "ar": "غرينادا", "en": "Grenada"},
  {"id": "GLP", "ar": "غوادلوب", "en": "Guadeloupe"},
  {"id": "GUM", "ar": "غوام", "en": "Guam"},
  {"id": "GTM", "ar": "غواتيمالا", "en": "Guatemala"},
  {"id": "GGY", "ar": "غيرنزي", "en": "Guernsey"},
  {"id": "GIN", "ar": "غينيا", "en": "Guinea"},
  {"id": "GNB", "ar": "غينيا بيساو", "en": "Guinea-Bissau"},
  {"id": "GUY", "ar": "غويانا", "en": "Guyana"},
  {"id": "HTI", "ar": "هايتي", "en": "Haiti"},
  {"id": "HMD", "ar": "جزيرة هيرد وجزر ماكدونالد", "en": "Heard Island and McDonald Islands"},
  {"id": "VAT", "ar": "الكرسي الرسولي", "en": "Holy See"},
  {"id": "HND", "ar": "هندوراس", "en": "Honduras"},
  {"id": "HKG", "ar": "هونج كونج", "en": "Hong Kong"},
  {"id": "HUN", "ar": "المجر", "en": "Hungary"},
  {"id": "ISL", "ar": "آيسلندا", "en": "Iceland"},
  {"id": "IND", "ar": "الهند", "en": "India"},
  {"id": "IDN", "ar": "إندونيسيا", "en": "Indonesia"},
  {"id": "IRN", "ar": "إيران", "en": "Iran"},
  {"id": "IRL", "ar": "أيرلندا", "en": "Ireland"},
  {"id": "IMN", "ar": "جزيرة مان", "en": "Isle of Man"},
  {"id": "ITA", "ar": "إيطاليا", "en": "Italy"},
  {"id": "JAM", "ar": "جامايكا", "en": "Jamaica"},
  {"id": "JPN", "ar": "اليابان", "en": "Japan"},
  {"id": "JEY", "ar": "جيرسي", "en": "Jersey"},
  {"id": "KAZ", "ar": "كازاخستان", "en": "Kazakhstan"},
  {"id": "KEN", "ar": "كينيا", "en": "Kenya"},
  {"id": "KIR", "ar": "كيريباتي", "en": "Kiribati"},
  {"id": "PRK", "ar": "كوريا الشمالية", "en": "Korea, Democratic People's Republic of"},
  {"id": "KOR", "ar": "كوريا الجنوبية", "en": "Korea, Republic of"},
  {"id": "KGZ", "ar": "قيرغيزستان", "en": "Kyrgyzstan"},
  {"id": "LAO", "ar": "لاوس", "en": "Lao People's Democratic Republic"},
  {"id": "LVA", "ar": "لاتفيا", "en": "Latvia"},
  {"id": "LSO", "ar": "ليسوتو", "en": "Lesotho"},
  {"id": "LBR", "ar": "ليبيريا", "en": "Liberia"},
  {"id": "LIE", "ar": "ليختنشتاين", "en": "Liechtenstein"},
  {"id": "LTU", "ar": "ليتوانيا", "en": "Lithuania"},
  {"id": "LUX", "ar": "لوكسمبورغ", "en": "Luxembourg"},
  {"id": "MAC", "ar": "ماكاو", "en": "Macao"},
  {"id": "MDG", "ar": "مدغشقر", "en": "Madagascar"},
  {"id": "MWI", "ar": "مالاوي", "en": "Malawi"},
  {"id": "MYS", "ar": "ماليزيا", "en": "Malaysia"},
  {"id": "MDV", "ar": "جزر المالديف", "en": "Maldives"},
  {"id": "MLI", "ar": "مالي", "en": "Mali"},
  {"id": "MLT", "ar": "مالطا", "en": "Malta"},
  {"id": "MHL", "ar": "جزر مارشال", "en": "Marshall Islands"},
  {"id": "MTQ", "ar": "مارتينيك", "en": "Martinique"},
  {"id": "MUS", "ar": "موريشيوس", "en": "Mauritius"},
  {"id": "MYT", "ar": "مايوت", "en": "Mayotte"},
  {"id": "MEX", "ar": "المكسيك", "en": "Mexico"},
  {"id": "FSM", "ar": "ميكرونيزيا", "en": "Micronesia"},
  {"id": "MDA", "ar": "مولدوفا", "en": "Moldova"},
  {"id": "MCO", "ar": "موناكو", "en": "Monaco"},
  {"id": "MNG", "ar": "منغوليا", "en": "Mongolia"},
  {"id": "MNE", "ar": "الجبل الأسود", "en": "Montenegro"},
  {"id": "MSR", "ar": "مونتسيرات", "en": "Montserrat"},
  {"id": "MOZ", "ar": "موزمبيق", "en": "Mozambique"},
  {"id": "MMR", "ar": "ميانمار", "en": "Myanmar"},
  {"id": "NAM", "ar": "ناميبيا", "en": "Namibia"},
  {"id": "NRU", "ar": "ناورو", "en": "Nauru"},
  {"id": "NPL", "ar": "نيبال", "en": "Nepal"},
  {"id": "NLD", "ar": "هولندا", "en": "Netherlands"},
  {"id": "NCL", "ar": "كاليدونيا الجديدة", "en": "New Caledonia"},
  {"id": "NZL", "ar": "نيوزيلندا", "en": "New Zealand"},
  {"id": "NIC", "ar": "نيكاراغوا", "en": "Nicaragua"},
  {"id": "NER", "ar": "النيجر", "en": "Niger"},
  {"id": "NGA", "ar": "نيجيريا", "en": "Nigeria"},
  {"id": "NIU", "ar": "نيوي", "en": "Niue"},
  {"id": "NFK", "ar": "جزيرة نورفولك", "en": "Norfolk Island"},
  {"id": "MKD", "ar": "مقدونيا الشمالية", "en": "North Macedonia"},
  {"id": "MNP", "ar": "جزر ماريانا الشمالية", "en": "Northern Mariana Islands"},
  {"id": "NOR", "ar": "النرويج", "en": "Norway"},
  {"id": "PAK", "ar": "باكستان", "en": "Pakistan"},
  {"id": "PLW", "ar": "بالاو", "en": "Palau"},
  {"id": "PAN", "ar": "بنما", "en": "Panama"},
  {"id": "PNG", "ar": "بابوا غينيا الجديدة", "en": "Papua New Guinea"},
  {"id": "PRY", "ar": "باراغواي", "en": "Paraguay"},
  {"id": "PER", "ar": "بيرو", "en": "Peru"},
  {"id": "PHL", "ar": "الفلبين", "en": "Philippines"},
  {"id": "PCN", "ar": "بيتكيرن", "en": "Pitcairn"},
  {"id": "POL", "ar": "بولندا", "en": "Poland"},
  {"id": "PRT", "ar": "البرتغال", "en": "Portugal"},
  {"id": "PRI", "ar": "بورتوريكو", "en": "Puerto Rico"},
  {"id": "REU", "ar": "ريونيون", "en": "Réunion"},
  {"id": "ROU", "ar": "رومانيا", "en": "Romania"},
  {"id": "RUS", "ar": "الاتحاد الروسي", "en": "Russian Federation"},
  {"id": "RWA", "ar": "رواندا", "en": "Rwanda"},
  {"id": "BLM", "ar": "سان بارتليمي", "en": "Saint Barthélemy"},
  {"id": "SHN", "ar": "سانت هيلينا وأسنسيون وتريستان دا كونا", "en": "Saint Helena, Ascension and Tristan da Cunha"},
  {"id": "KNA", "ar": "سانت كيتس ونيفيس", "en": "Saint Kitts and Nevis"},
  {"id": "LCA", "ar": "سانت لوسيا", "en": "Saint Lucia"},
  {"id": "MAF", "ar": "سانت مارتن (الجزء الفرنسي)", "en": "Saint Martin (French part)"},
  {"id": "SPM", "ar": "سان بيير وميكلون", "en": "Saint Pierre and Miquelon"},
  {"id": "VCG", "ar": "سانت فينسنت والغرينادين", "en": "Saint Vincent and the Grenadines"},
  {"id": "WSM", "ar": "ساموا", "en": "Samoa"},
  {"id": "SMR", "ar": "سان مارينو", "en": "San Marino"},
  {"id": "STP", "ar": "ساو تومي وبرينسيب", "en": "Sao Tome and Principe"},
  {"id": "SEN", "ar": "السنغال", "en": "Senegal"},
  {"id": "SRB", "ar": "صربيا", "en": "Serbia"},
  {"id": "SYC", "ar": "سيشل", "en": "Seychelles"},
  {"id": "SLE", "ar": "سيراليون", "en": "Sierra Leone"},
  {"id": "SGP", "ar": "سنغافورة", "en": "Singapore"},
  {"id": "SXM", "ar": "سينت مارتن (الجزء الهولندي)", "en": "Sint Maarten (Dutch part)"},
  {"id": "SVK", "ar": "سلوفاكيا", "en": "Slovakia"},
  {"id": "SVN", "ar": "سلوفينيا", "en": "Slovenia"},
  {"id": "SLB", "ar": "جزر سليمان", "en": "Solomon Islands"},
  {"id": "ZAF", "ar": "جنوب أفريقيا", "en": "South Africa"},
  {"id": "SGS", "ar": "جورجيا الجنوبية وجزر ساندويتش الجنوبية", "en": "South Georgia and the South Sandwich Islands"},
  {"id": "SSD", "ar": "جنوب السودان", "en": "South Sudan"},
  {"id": "ESP", "ar": "إسبانيا", "en": "Spain"},
  {"id": "LKA", "ar": "سريلانكا", "en": "Sri Lanka"},
  {"id": "SUR", "ar": "سورينام", "en": "Suriname"},
  {"id": "SJM", "ar": "سفالبارد وجان ماين", "en": "Svalbard and Jan Mayen"},
  {"id": "SWE", "ar": "السويد", "en": "Sweden"},
  {"id": "CHE", "ar": "سويسرا", "en": "Switzerland"},
  {"id": "TWN", "ar": "تايوان", "en": "Taiwan"},
  {"id": "TJK", "ar": "طاجيكستان", "en": "Tajikistan"},
  {"id": "TZA", "ar": "تنزانيا", "en": "Tanzania"},
  {"id": "THA", "ar": "تايلاند", "en": "Thailand"},
  {"id": "TLS", "ar": "تيمور الشرقية", "en": "Timor-Leste"},
  {"id": "TGO", "ar": "توغو", "en": "Togo"},
  {"id": "TKL", "ar": "توكيلاو", "en": "Tokelau"},
  {"id": "TON", "ar": "تونغا", "en": "Tonga"},
  {"id": "TTO", "ar": "ترينيداد وتوباغو", "en": "Trinidad and Tobago"},
  {"id": "TUR", "ar": "Türkiye", "en": "Türkiye"},
  {"id": "TKM", "ar": "تركمانستان", "en": "Turkmenistan"},
  {"id": "TCA", "ar": "جزر تركس وكايكوس", "en": "Turks and Caicos Islands"},
  {"id": "TUV", "ar": "توفالو", "en": "Tuvalu"},
  {"id": "UGA", "ar": "أوغندا", "en": "Uganda"},
  {"id": "UKR", "ar": "أوكرانيا", "en": "Ukraine"},
  {"id": "GBR", "ar": "المملكة المتحدة", "en": "United Kingdom"},
  {"id": "USA", "ar": "الولايات المتحدة الأمريكية", "en": "United States"},
  {"id": "UMI", "ar": "جزر الولايات المتحدة الصغيرة النائية", "en": "United States Minor Outlying Islands"},
  {"id": "URY", "ar": "أوروغواي", "en": "Uruguay"},
  {"id": "UZB", "ar": "أوزبكستان", "en": "Uzbekistan"},
  {"id": "VUT", "ar": "فانواتو", "en": "Vanuatu"},
  {"id": "VEN", "ar": "فنزويلا", "en": "Venezuela"},
  {"id": "VNM", "ar": "فيتنام", "en": "Viet Nam"},
  {"id": "VGB", "ar": "جزر العذراء البريطانية", "en": "Virgin Islands, British"},
  {"id": "VIR", "ar": "جزر العذراء الأمريكية", "en": "Virgin Islands, U.S."},
  {"id": "WLF", "ar": "واليس وفوتونا", "en": "Wallis and Futuna"},
  {"id": "ESH", "ar": "الصحراء الغربية", "en": "Western Sahara"},
  {"id": "ZMB", "ar": "زامبيا", "en": "Zambia"},
  {"id": "ZWE", "ar": "زيمبابوي", "en": "Zimbabwe"}
];

const PLATE_TYPES = [
  { id: "1", ar: "خصوصي", en: "Private" },
  { id: "2", ar: "خصوصي (Q)", en: "Private (Q)" },
  { id: "3", ar: "خصوصي (T)", en: "Private (T)" },
  { id: "4", ar: "خصوصي (R)", en: "Private (R)" },
  { id: "5", ar: "حكومة", en: "Government" },
  { id: "6", ar: "تجارية", en: "Commercial" },
  { id: "7", ar: "نقل خاص", en: "Private Transport" },
  { id: "8", ar: "آليات", en: "Machinery" },
  { id: "9", ar: "مقطورة", en: "Trailer" },
  { id: "10", ar: "نقل عام", en: "Public Transport" },
  { id: "11", ar: "هيئة دبلوماسية", en: "Diplomatic Corps" },
  { id: "12", ar: "شرطة", en: "Police" },
  { id: "13", ar: "دراجة نارية شرطة", en: "Police Motorcycle" },
  { id: "14", ar: "دراجة نارية خصوصية", en: "Private Motorcycle" },
  { id: "15", ar: "أجرة", en: "Taxi" },
  { id: "16", ar: "سيارة لخويا", en: "Lekhwiya Car" },
  { id: "17", ar: "دراجة لخويا", en: "Lekhwiya Motorcycle" },
  { id: "18", ar: "سيارة الحرس الأميري", en: "Amiri Guard Car" },
  { id: "19", ar: "دراجة الحرس الأميري", en: "Amiri Guard Motorcycle" },
  { id: "20", ar: "ليموزين", en: "Limousine" },
  { id: "21", ar: "القوات المسلحة القطرية", en: "Qatar Armed Forces" },
  { id: "22", ar: "إدخال مؤقت", en: "Temporary Entry" },
  { id: "23", ar: "معدة", en: "Equipment" },
  { id: "24", ar: "هيئة الامم المتحدة", en: "United Nations" },
  { id: "25", ar: "تصْدير", en: "Export" },
  { id: "26", ar: "آليات حكومية", en: "Government Machinery" },
  { id: "27", ar: "تحت التجربة", en: "Under Test" },
  { id: "28", ar: "مقطورة حكومية", en: "Government Trailer" }
];

export default function Home() {
  const { lang } = useLanguage();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [inquiryType, setInquiryType] = useState<"plate" | "qid" | "establishment">("plate");
  const [plateSource, setPlateSource] = useState("QAT");
  const [plateType, setPlateType] = useState("1");
  const [plateNumber, setPlateNumber] = useState("");
  const [ownerIdType, setOwnerIdType] = useState<"qid" | "establishment">("qid");
  const [ownerId, setOwnerId] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaUrl, setCaptchaUrl] = useState(`/api/captcha?t=${Date.now()}`);
  const [isSolvingCaptcha, setIsSolvingCaptcha] = useState(false);
  const [sessionId] = useState(() => {
    const saved = localStorage.getItem("paymentSessionId");
    if (saved) return saved;
    const newId = nanoid();
    localStorage.setItem("paymentSessionId", newId);
    return newId;
  });

  const isAr = lang === "ar";
  
  const refreshCaptcha = () => {
    setCaptchaUrl(`/api/captcha?t=${Date.now()}`);
    setCaptcha("");
  };

  const solveCaptchaAuto = async () => {
    try {
      setIsSolvingCaptcha(true);
      const t = Date.now();
      const response = await fetch(`/api/captcha?t=${t}&auto=true`);
      const data = await response.json();
      if (data.success && data.code) {
        setCaptcha(data.code);
        setCaptchaUrl(data.image);
        toast.success(isAr ? "تم حل الرمز تلقائياً" : "Captcha solved automatically");
      } else {
        refreshCaptcha();
      }
    } catch (error) {
      console.error("Auto captcha error:", error);
      refreshCaptcha();
    } finally {
      setIsSolvingCaptcha(false);
    }
  };

  useEffect(() => {
    // حل الكابتشا تلقائياً عند تحميل الصفحة أو تحديث الرابط
    solveCaptchaAuto();
  }, []);

  const updateStageMutation = trpc.payment.updateStage.useMutation();

  useEffect(() => {
    updateStageMutation.mutate({ sessionId, stage: "home" });
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/visitors?page=/&sessionId=${sessionId}`);
    return () => ws.close();
  }, []);

  const queryMutation = trpc.fines.query.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        if (data.totalFines === 0) {
          toast.info(isAr ? "لا توجد مخالفات مسجلة" : "No violations recorded");
        } else {
          setLocation(`/violations-results?session=${data.sessionId}`);
        }
      } else {
        toast.error(data.errorMessage || (isAr ? "فشل الاستعلام" : "Query failed"));
        refreshCaptcha();
        setCaptcha("");
      }
    },
  });

  const handleSearch = () => {
    if (inquiryType === "plate") {
      if (!plateNumber) {
        toast.error(isAr ? "الرجاء إدخال رقم اللوحة" : "Please enter plate number");
        return;
      }
      if (!ownerId) {
        toast.error(ownerIdType === "qid" 
          ? (isAr ? "الرجاء إدخال الرقم الشخصي" : "Please enter personal ID")
          : (isAr ? "الرجاء إدخال رقم المنشأة" : "Please enter establishment ID")
        );
        return;
      }
    } else {
      if (!ownerId) {
        toast.error(inquiryType === "qid" 
          ? (isAr ? "الرجاء إدخال الرقم الشخصي" : "Please enter personal ID")
          : (isAr ? "الرجاء إدخال رقم المنشأة" : "Please enter establishment ID")
        );
        return;
      }
    }

    if (!captcha) {
      if (isSolvingCaptcha) {
        toast.info(isAr ? "جاري حل الرمز تلقائياً، يرجى الانتظار..." : "Solving captcha automatically, please wait...");
        // محاولة الانتظار قليلاً ثم الضغط تلقائياً
        setTimeout(() => handleSearch(), 2000);
        return;
      }
      toast.error(isAr ? "الرجاء الانتظار حتى يكتمل حل الرمز" : "Please wait for captcha to be solved");
      return;
    }

    updateStageMutation.mutate({ sessionId, stage: "inquiry" });
    
    queryMutation.mutate({
      sessionId,
      inquiryType,
      plateSource: inquiryType === "plate" ? plateSource : undefined,
      plateNumber: inquiryType === "plate" ? plateNumber : undefined,
      plateType: inquiryType === "plate" ? plateType : undefined,
      ownerIdType: inquiryType === "plate" ? ownerIdType : (inquiryType as any),
      ownerId: ownerId,
      captcha,
      lang: isAr ? "ar" : "en",
    });
  };

  return (
    <div className="min-h-screen bg-[#edf2f7] flex flex-col" dir={isAr ? "rtl" : "ltr"}>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-4 max-w-lg">
        {/* Page Title */}
        <div className="text-center mb-6">
          <h1 className="text-[#003E66] text-xl font-bold border-b border-gray-200 pb-2 inline-block px-8">
            {t("home.title")}
          </h1>
        </div>

        {/* Inquiry Type Tabs */}
        <div className="flex justify-between gap-2 mb-4">
          {[
            { id: "plate", icon: "/icon-plate-new.png", label: t("home.tabs.plate") },
            { id: "qid", icon: "/icon-qid-new.png", label: t("home.tabs.qid") },
            { id: "establishment", icon: "/icon-establishment-new.png", label: t("home.tabs.establishment") }
          ].map(type => (
            <button
              key={type.id}
              onClick={() => setInquiryType(type.id as any)}
              className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl border transition-all bg-white h-28 ${
                inquiryType === type.id 
                ? "border-[#003E66] shadow-sm ring-1 ring-[#003E66]" 
                : "border-gray-200"
              }`}
            >
              <div className="mb-1 w-14 h-14 flex items-center justify-center">
                <img 
                  src={type.icon} 
                  alt={type.label} 
                  className={`w-12 h-12 object-contain transition-all ${inquiryType === type.id ? "" : "opacity-40 grayscale"}`}
                />
              </div>
              <span className={`text-[13px] font-bold ${inquiryType === type.id ? "text-[#003E66]" : "text-gray-500"}`}>
                {type.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6">
            <h2 className="text-[#003E66] text-lg font-bold text-center mb-6">
              {t(`home.inquiryTitle.${inquiryType}`)}
            </h2>

            <div className="space-y-5">
              {inquiryType === "plate" ? (
                <>
                  {/* Country Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{t("home.labels.country")}</label>
                    <div className="relative">
                      <select 
                        value={plateSource}
                        onChange={e => setPlateSource(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#003E66] text-gray-700"
                      >
                        {COUNTRIES.map(c => (
                          <option key={c.id} value={c.id}>{isAr ? c.ar : c.en}</option>
                        ))}
                      </select>
                      <div className={`absolute inset-y-0 ${isAr ? "left-4" : "right-4"} flex items-center pointer-events-none text-gray-400`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Plate Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{t("home.labels.plateType")}</label>
                    <div className="relative">
                      <select 
                        value={plateType}
                        onChange={e => setPlateType(e.target.value)}
                        className="w-full bg-[#f8f9fa] border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-1 focus:ring-[#003E66] text-gray-700"
                      >
                        {PLATE_TYPES.map(p => (
                          <option key={p.id} value={p.id}>{isAr ? p.ar : p.en}</option>
                        ))}
                      </select>
                      <div className={`absolute inset-y-0 ${isAr ? "left-4" : "right-4"} flex items-center pointer-events-none text-gray-400`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </div>

                  {/* Plate Number Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">{t("home.labels.plateNumber")}</label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={e => setPlateNumber(e.target.value)}
                      placeholder={t("home.placeholders.plateNumber")}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                    />
                  </div>

                  {/* Owner Data Section */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-600 mb-3">{t("home.labels.ownerData")}</label>
                    <div className="flex gap-6 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="ownerIdType"
                            checked={ownerIdType === "qid"}
                            onChange={() => setOwnerIdType("qid")}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${ownerIdType === "qid" ? "border-[#003E66]" : "border-gray-300"}`}></div>
                          {ownerIdType === "qid" && <div className="absolute w-2.5 h-2.5 rounded-full bg-[#003E66]"></div>}
                        </div>
                        <span className="text-sm text-gray-700">{t("home.labels.qidType")}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="radio" 
                            name="ownerIdType"
                            checked={ownerIdType === "establishment"}
                            onChange={() => setOwnerIdType("establishment")}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 transition-all ${ownerIdType === "establishment" ? "border-[#003E66]" : "border-gray-300"}`}></div>
                          {ownerIdType === "establishment" && <div className="absolute w-2.5 h-2.5 rounded-full bg-[#003E66]"></div>}
                        </div>
                        <span className="text-sm text-gray-700">{t("home.labels.establishmentType")}</span>
                      </label>
                    </div>
                    <input
                      type="text"
                      value={ownerId}
                      onChange={e => setOwnerId(e.target.value)}
                      placeholder={ownerIdType === "qid" ? t("home.placeholders.personalId") : t("home.placeholders.establishmentId")}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    {inquiryType === "qid" ? t("home.labels.personalId") : t("home.labels.establishmentId")}
                  </label>
                  <input
                    type="text"
                    value={ownerId}
                    onChange={e => setOwnerId(e.target.value)}
                    placeholder={inquiryType === "qid" ? t("home.placeholders.personalId") : t("home.placeholders.establishmentId")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                  />
                </div>
              )}

              {/* Captcha Section */}
              <div className="pt-2">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-12 flex-shrink-0 flex items-center justify-center w-32 relative">
                      {isSolvingCaptcha && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                          <div className="w-5 h-5 border-2 border-[#003E66] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img 
                        src={captchaUrl} 
                        alt="captcha" 
                        className={`h-full w-full object-contain transition-opacity duration-300 ${isSolvingCaptcha ? 'opacity-30' : 'opacity-100'}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40' viewBox='0 0 120 40'%3E%3Crect width='120' height='40' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='10' fill='%239ca3af'%3ELoading...%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => solveCaptchaAuto()}
                        disabled={isSolvingCaptcha}
                        className="p-2.5 text-[#003E66] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        title={isAr ? "تحديث وحل تلقائي" : "Refresh and solve auto"}
                      >
                        {isSolvingCaptcha ? (
                          <div className="w-5 h-5 border-2 border-[#003E66] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={captcha}
                    onChange={e => setCaptcha(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#003E66] placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 pt-4">
                <button
                  onClick={handleSearch}
                  disabled={queryMutation.isPending}
                  className="w-full bg-[#003E66] hover:bg-[#002d4d] text-white py-4 rounded-xl font-bold shadow-md transition-all disabled:opacity-70"
                >
                  {queryMutation.isPending ? (isAr ? "جاري الاستعلام..." : "Searching...") : t("home.buttons.search")}
                </button>
                <button
                  onClick={() => {
                    setPlateNumber("");
                    setOwnerId("");
                    setCaptcha("");
                  }}
                  className="w-full bg-white border border-[#003E66] text-[#003E66] py-4 rounded-xl font-bold hover:bg-gray-50 transition-all"
                >
                  {t("home.buttons.clear")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Extra Space for Bottom Nav if any */}
        <div className="h-8"></div>
      </main>

      <Footer />
    </div>
  );
}
