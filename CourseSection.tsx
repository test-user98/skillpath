import { useEffect, useState } from "react"
import { addPropertyControls, ControlType } from "framer"

// This API fails ~1 in 3 requests on purpose, so every call retries.
const API_BASE = "https://syncsphere-hiv6.onrender.com"
const FETCH_ATTEMPTS = 3

interface Course {
    courseName: string
    courseCode: string
    description: string
    mainCategory: string
    shortCourse: string
    courseType: string
    pricePaise: number
    priceUsdCents: number
    mangoId: string
    refundable: boolean
}

type CountryCode = "IN" | "US"

async function fetchWithRetry(url: string): Promise<any> {
    let lastError: unknown
    for (let attempt = 1; attempt <= FETCH_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                throw new Error("Request failed with status " + response.status)
            }
            return await response.json()
        } catch (error) {
            lastError = error
            if (attempt < FETCH_ATTEMPTS) {
                // failures come in bursts, so wait a bit longer each try
                await new Promise((resolve) =>
                    setTimeout(resolve, 600 * attempt)
                )
            }
        }
    }
    throw lastError
}

// Prices arrive in paise / cents, so divide by 100 before formatting.
function formatPrice(course: Course, country: CountryCode): string {
    const isIndia = country === "IN"
    const amount = (isIndia ? course.pricePaise : course.priceUsdCents) / 100
    return new Intl.NumberFormat(isIndia ? "en-IN" : "en-US", {
        style: "currency",
        currency: isIndia ? "INR" : "USD",
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount)
}

function CourseCard(props: {
    course: Course
    country: CountryCode
    accentColor: string
}) {
    const { course, country, accentColor } = props
    return (
        <div className="sp-card">
            <div className="sp-card-top">
                <span className="sp-tag" style={{ color: accentColor }}>
                    {course.mainCategory}
                </span>
                {course.refundable && (
                    <span className="sp-badge">Refundable</span>
                )}
            </div>
            <h3 className="sp-card-title">{course.courseName}</h3>
            <p className="sp-card-desc">{course.description}</p>
            <div className="sp-card-price">{formatPrice(course, country)}</div>
        </div>
    )
}

function SkeletonGrid() {
    return (
        <div className="sp-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
                <div className="sp-card" key={n}>
                    <div className="sp-skeleton" style={{ width: "40%" }} />
                    <div
                        className="sp-skeleton"
                        style={{ width: "80%", height: 20 }}
                    />
                    <div className="sp-skeleton" style={{ width: "100%" }} />
                    <div className="sp-skeleton" style={{ width: "90%" }} />
                    <div
                        className="sp-skeleton"
                        style={{ width: "30%", height: 20 }}
                    />
                </div>
            ))}
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function CourseSection({
    heading = "Popular courses",
    accentColor = "#4F46E5",
    style,
}: {
    heading?: string
    accentColor?: string
    style?: React.CSSProperties
}) {
    const [status, setStatus] = useState<"loading" | "error" | "ready">(
        "loading"
    )
    const [courses, setCourses] = useState<Course[]>([])
    const [country, setCountry] = useState<CountryCode | null>(null)
    const [search, setSearch] = useState("")
    const [sortOrder, setSortOrder] = useState("default")
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let cancelled = false
        setStatus("loading")

        async function load() {
            // allSettled, not all: a failed country lookup should not
            // take the courses down with it.
            const [courseResult, countryResult] = await Promise.allSettled([
                fetchWithRetry(API_BASE + "/assignment/course-data"),
                fetchWithRetry(API_BASE + "/assignment/country-code"),
            ])
            if (cancelled) return

            if (courseResult.status === "rejected") {
                setStatus("error")
                return
            }
            setCourses(
                Array.isArray(courseResult.value) ? courseResult.value : []
            )

            // Unknown country: keep the courses, price in USD, show a note.
            const code =
                countryResult.status === "fulfilled"
                    ? countryResult.value.country_code
                    : null
            setCountry(code === "IN" || code === "US" ? code : null)
            setStatus("ready")
        }

        load()
        return () => {
            cancelled = true
        }
    }, [retryCount])

    const displayCountry: CountryCode = country ?? "US"

    let visibleCourses = courses
    const query = search.trim().toLowerCase()
    if (query) {
        visibleCourses = visibleCourses.filter(
            (c) =>
                c.courseName.toLowerCase().includes(query) ||
                c.mainCategory.toLowerCase().includes(query)
        )
    }
    if (sortOrder !== "default") {
        const priceKey =
            displayCountry === "IN" ? "pricePaise" : "priceUsdCents"
        visibleCourses = [...visibleCourses].sort((a, b) =>
            sortOrder === "low-high"
                ? a[priceKey] - b[priceKey]
                : b[priceKey] - a[priceKey]
        )
    }

    return (
        <section
            id="courses"
            className="sp-section"
            style={{ ...style, width: "100%" }}
        >
            <style>{styles}</style>
            <div className="sp-inner">
                <div className="sp-header">
                    <h2 className="sp-heading">{heading}</h2>
                    {status === "ready" && courses.length > 0 && (
                        <div className="sp-controls">
                            <input
                                className="sp-search"
                                type="text"
                                placeholder="Search courses"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <select
                                className="sp-sort"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="default">Featured</option>
                                <option value="low-high">
                                    Price: low to high
                                </option>
                                <option value="high-low">
                                    Price: high to low
                                </option>
                            </select>
                        </div>
                    )}
                </div>

                {status === "ready" && country === null && (
                    <p className="sp-note">
                        We couldn't detect your region, so prices are shown in
                        USD.
                    </p>
                )}

                {status === "loading" && <SkeletonGrid />}

                {status === "error" && (
                    <div className="sp-message">
                        <p>Something went wrong while loading the courses.</p>
                        <button
                            className="sp-retry"
                            style={{ background: accentColor }}
                            onClick={() => setRetryCount(retryCount + 1)}
                        >
                            Try again
                        </button>
                    </div>
                )}

                {status === "ready" && courses.length === 0 && (
                    <p className="sp-message">
                        No courses are available right now. Please check back
                        soon.
                    </p>
                )}

                {status === "ready" &&
                    courses.length > 0 &&
                    visibleCourses.length === 0 && (
                        <p className="sp-message">
                            No courses match your search.
                        </p>
                    )}

                {status === "ready" && visibleCourses.length > 0 && (
                    <div className="sp-grid">
                        {visibleCourses.map((course) => (
                            <CourseCard
                                key={course.mangoId}
                                course={course}
                                country={displayCountry}
                                accentColor={accentColor}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

addPropertyControls(CourseSection, {
    heading: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Popular courses",
    },
    accentColor: {
        type: ControlType.Color,
        title: "Accent",
        defaultValue: "#4F46E5",
    },
})

const styles = `
.sp-section {
    font-family: "Inter", system-ui, sans-serif;
    color: #17171c;
}
.sp-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 56px 24px;
}
.sp-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 24px;
}
.sp-heading {
    font-size: 28px;
    font-weight: 700;
    margin: 0;
}
.sp-controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}
.sp-search,
.sp-sort {
    font: inherit;
    font-size: 14px;
    padding: 8px 12px;
    border: 1px solid #d9d9e0;
    border-radius: 8px;
    background: #fff;
}
.sp-note {
    font-size: 14px;
    color: #7a5a00;
    background: #fdf4d7;
    border-radius: 8px;
    padding: 10px 14px;
    margin: 0 0 20px;
}
.sp-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}
@media (max-width: 1024px) {
    .sp-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
    .sp-grid { grid-template-columns: 1fr; }
}
.sp-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #fff;
    border: 1px solid #e6e6ec;
    border-radius: 12px;
    padding: 20px;
}
.sp-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
}
.sp-tag {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.sp-badge {
    font-size: 12px;
    font-weight: 500;
    color: #086343;
    background: #dcf5ea;
    border-radius: 999px;
    padding: 3px 10px;
}
.sp-card-title {
    font-size: 18px;
    font-weight: 650;
    margin: 0;
}
.sp-card-desc {
    font-size: 14px;
    line-height: 1.5;
    color: #5c5c66;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.sp-card-price {
    font-size: 18px;
    font-weight: 700;
    margin-top: auto;
}
.sp-message {
    text-align: center;
    color: #5c5c66;
    padding: 48px 16px;
}
.sp-retry {
    font: inherit;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    margin-top: 12px;
    cursor: pointer;
}
.sp-skeleton {
    height: 14px;
    border-radius: 6px;
    background: #ececf1;
    animation: sp-pulse 1.2s ease-in-out infinite;
}
@keyframes sp-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.45; }
}
`
