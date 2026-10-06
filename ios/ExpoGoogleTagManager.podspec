require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))
package_version = package['version']
version_without_prerelease = package_version.split('-').first

Pod::Spec.new do |s|
  s.name           = 'ExpoGoogleTagManager'
  s.version        = version_without_prerelease
  s.summary        = package['description']
  s.description    = package['description']
  s.license        = package['license']
  s.author         = package['author']
  s.homepage       = package['homepage']
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: package['repository']['url'].delete_prefix('git+'), tag: "v#{package_version}" }
  s.static_framework = true

  s.dependency 'GoogleTagManager', '~> 9.2'
end
