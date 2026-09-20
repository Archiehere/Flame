// Run from apps/mobile: swift scripts/generate-icons.swift
// Uses macOS AppKit to export the checked-in SVG without extra dependencies.
import AppKit

let assets = URL(fileURLWithPath: FileManager.default.currentDirectoryPath).appendingPathComponent("assets")
let svg = try String(contentsOf: assets.appendingPathComponent("flame.svg"), encoding: .utf8)
let foreground = svg.replacingOccurrences(of: #"<circle[^>]*/>"#, with: "", options: .regularExpression)
let monochrome = foreground
    .replacingOccurrences(of: #"<g class="st1">[\s\S]*?</g>"#, with: "", options: .regularExpression)
    .replacingOccurrences(of: "#F5CF87", with: "#FFFFFF")
let background = NSColor(srgbRed: 199 / 255, green: 92 / 255, blue: 92 / 255, alpha: 1)

func render(_ name: String, size: Int, artwork: String?, scale: CGFloat = 1, opaque: Bool = false) throws {
    let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
        isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
    let bounds = NSRect(x: 0, y: 0, width: size, height: size)
    if opaque { background.setFill(); bounds.fill() }
    if let artwork {
        let image = NSImage(data: Data(artwork.utf8))!
        let inset = CGFloat(size) * (1 - scale) / 2
        image.draw(in: bounds.insetBy(dx: inset, dy: inset))
    }
    NSGraphicsContext.restoreGraphicsState()
    var output = bitmap
    if opaque {
        // Strip the alpha channel for the iOS App Store icon.
        let rendered = NSBitmapImageRep(data: bitmap.representation(using: .png, properties: [:])!)!
        output = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
            bitsPerSample: 8, samplesPerPixel: 3, hasAlpha: false,
            isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
        for y in 0..<size {
            for x in 0..<size {
                let source = y * rendered.bytesPerRow + x * 4
                let target = y * output.bytesPerRow + x * 3
                for channel in 0..<3 { output.bitmapData![target + channel] = rendered.bitmapData![source + channel] }
            }
        }
    }
    try output.representation(using: .png, properties: [:])!.write(to: assets.appendingPathComponent(name))
}

try render("icon.png", size: 1024, artwork: svg, opaque: true)
try render("splash-icon.png", size: 1024, artwork: svg)
// Keep the flame inside Android's central adaptive-icon safe zone.
try render("android-icon-foreground.png", size: 1024, artwork: foreground, scale: 0.72)
try render("android-icon-background.png", size: 1024, artwork: nil, opaque: true)
try render("android-icon-monochrome.png", size: 1024, artwork: monochrome, scale: 0.72)
try render("favicon.png", size: 48, artwork: svg)
