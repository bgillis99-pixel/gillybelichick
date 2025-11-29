//
//  CameraService.swift
//  Camera and VIN detection service
//

import AVFoundation
import Vision
import SwiftUI

class CameraService: NSObject, ObservableObject {
    @Published var session = AVCaptureSession()
    @Published var detectedVIN: String?

    private var videoOutput = AVCaptureVideoDataOutput()
    private let sessionQueue = DispatchQueue(label: "camera.session.queue")

    func checkPermissions() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            setupSession()
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { [weak self] granted in
                if granted {
                    self?.setupSession()
                }
            }
        default:
            break
        }
    }

    private func setupSession() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }

            self.session.beginConfiguration()
            self.session.sessionPreset = .photo

            // Add camera input
            guard let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .back),
                  let input = try? AVCaptureDeviceInput(device: device) else {
                self.session.commitConfiguration()
                return
            }

            if self.session.canAddInput(input) {
                self.session.addInput(input)
            }

            // Add video output for VIN detection
            if self.session.canAddOutput(self.videoOutput) {
                self.session.addOutput(self.videoOutput)
                self.videoOutput.setSampleBufferDelegate(self, queue: DispatchQueue(label: "video.output.queue"))
            }

            self.session.commitConfiguration()
        }
    }

    func startSession() {
        sessionQueue.async { [weak self] in
            self?.session.startRunning()
        }
    }

    func stopSession() {
        sessionQueue.async { [weak self] in
            self?.session.stopRunning()
        }
    }
}

// MARK: - Video Output Delegate (for VIN detection)
extension CameraService: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard detectedVIN == nil else { return } // Stop scanning after detection

        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }

        // Use Vision framework to detect text (VIN)
        let request = VNRecognizeTextRequest { [weak self] request, error in
            guard let observations = request.results as? [VNRecognizedTextObservation] else { return }

            for observation in observations {
                guard let topCandidate = observation.topCandidates(1).first else { continue }
                let text = topCandidate.string

                // VINs are 17 characters, alphanumeric (excluding I, O, Q)
                if self?.isValidVIN(text) == true {
                    DispatchQueue.main.async {
                        self?.detectedVIN = text
                    }
                    return
                }
            }
        }

        request.recognitionLevel = .accurate

        let handler = VNImageRequestHandler(cvPixelBuffer: pixelBuffer, options: [:])
        try? handler.perform([request])
    }

    private func isValidVIN(_ text: String) -> Bool {
        let cleaned = text.filter { $0.isLetter || $0.isNumber }

        // VIN must be exactly 17 characters
        guard cleaned.count == 17 else { return false }

        // VINs don't contain I, O, Q
        guard !cleaned.contains(where: { "IOQ".contains($0) }) else { return false }

        return true
    }
}
