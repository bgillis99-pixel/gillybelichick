//
//  Typography.swift
//  Tesla-inspired typography system
//

import SwiftUI

extension Font {
    // Tesla uses SF Pro (Apple's default system font)
    static let teslaTitle = Font.system(size: 34, weight: .bold)
    static let teslaHeadline = Font.system(size: 20, weight: .semibold)
    static let teslaBody = Font.system(size: 17, weight: .regular)
    static let teslaCaption = Font.system(size: 13, weight: .medium)
    static let teslaMonospace = Font.system(size: 15, weight: .regular, design: .monospaced)
}
