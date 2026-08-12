import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Hero({
    headline = "Learn skills that actually pay off",
    subline = "Practical, project-based courses built by people who do the work.",
    buttonText = "Browse courses",
    style,
}: {
    headline?: string
    subline?: string
    buttonText?: string
    style?: React.CSSProperties
}) {
    return (
        <section
            style={{
                ...style,
                width: "100%",
                fontFamily: '"Inter", system-ui, sans-serif',
                textAlign: "center",
                padding: "110px 24px 90px",
                background: "#fff",
            }}
        >
            <h1
                style={{
                    fontSize: "clamp(34px, 6vw, 56px)",
                    fontWeight: 750,
                    color: "#17171c",
                    margin: "0 auto 16px",
                    maxWidth: 760,
                    lineHeight: 1.1,
                }}
            >
                {headline}
            </h1>
            <p
                style={{
                    fontSize: 18,
                    color: "#5c5c66",
                    margin: "0 auto 32px",
                    maxWidth: 560,
                    lineHeight: 1.5,
                }}
            >
                {subline}
            </p>
            <a
                href="#courses"
                style={{
                    display: "inline-block",
                    background: "#4F46E5",
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 600,
                    padding: "14px 32px",
                    borderRadius: 10,
                    textDecoration: "none",
                }}
            >
                {buttonText}
            </a>
        </section>
    )
}

addPropertyControls(Hero, {
    headline: {
        type: ControlType.String,
        title: "Headline",
        defaultValue: "Learn skills that actually pay off",
    },
    subline: {
        type: ControlType.String,
        title: "Subline",
        defaultValue:
            "Practical, project-based courses built by people who do the work.",
    },
    buttonText: {
        type: ControlType.String,
        title: "Button",
        defaultValue: "Browse courses",
    },
})
