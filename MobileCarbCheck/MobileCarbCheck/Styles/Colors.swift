//
//  Colors.swift
//  Tesla-inspired color palette
//

import SwiftUI

extension Color {
    // MARK: - Backgrounds
    static let teslaBlack = Color(hex: "0A0A0F")        // Deep black
    static let teslaGray = Color(hex: "1E1E24")         // Card background
    static let teslaCharcoal = Color(hex: "2A2A32")     // Secondary bg

    // MARK: - Accents
    static let teslaBlue = Color(hex: "3E6AE1")         // Primary action
    static let teslaGreen = Color(hex: "00D563")        // Success/Pass
    static let teslaRed = Color(hex: "FF4757")          // Fail/Error
    static let teslaYellow = Color(hex: "FFB800")       // Warning

    // MARK: - Text
    static let teslaWhite = Color(hex: "E8E8F0")        // Primary text
    static let teslaGrayText = Color(hex: "8E8E93")     // Secondary text

    // MARK: - Helper
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
