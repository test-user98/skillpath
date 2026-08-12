/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */
export default function Footer(props: { style?: React.CSSProperties }) {
    const linkStyle = {
        color: "#5c5c66",
        fontSize: 14,
        textDecoration: "none",
    }
    return (
        <footer
            style={{
                ...props.style,
                width: "100%",
                fontFamily: '"Inter", system-ui, sans-serif',
                borderTop: "1px solid #e6e6ec",
                padding: "32px 24px",
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "center",
                justifyContent: "space-between",
                background: "#fff",
            }}
        >
            <p style={{ margin: 0, fontSize: 14, color: "#8a8a94" }}>
                © 2026 Skillpath. All rights reserved.
            </p>
            <nav style={{ display: "flex", gap: 24 }}>
                <a href="#" style={linkStyle}>
                    About
                </a>
                <a href="#" style={linkStyle}>
                    Courses
                </a>
                <a href="#" style={linkStyle}>
                    Contact
                </a>
            </nav>
        </footer>
    )
}
