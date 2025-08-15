function App() {
  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container">
        <div className="text-center mb-8">
          <h1 className="title">TEO KICKS CLIENT</h1>
          <p className="text-2xl text-secondary">Button Showcase</p>
        </div>
        
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Button Variants */}
          <div className="space-y-4">
            <h2 className="title2">Button Styles</h2>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-outline">Outline Button</button>
            </div>
          </div>

          {/* Title Examples */}
          <div className="space-y-4 text-center">
            <h2 className="title2">Title Examples</h2>
            <h1 className="title">This is Title (Large)</h1>
            <h2 className="title2">This is Title2 (Medium)</h2>
            <h3 className="title3">This is Title3 (Small)</h3>
          </div>

          {/* Input Examples */}
          <div className="space-y-4">
            <h2 className="title2">Input Styles</h2>
            <input className="input" placeholder="Standard Input - Type something..." />
            <input className="input2" placeholder="Compact Input2 - Search here..." />
            <input className="input3" placeholder="Pill Input3 - Filter..." />
          </div>

          {/* Container Examples */}
          <div className="space-y-4">
            <h2 className="title2">Container Examples</h2>
            <div className="container-xs bg-gray-100 p-4 rounded">
              <p className="text-center">Container XS - Small container</p>
            </div>
            <div className="container-sm bg-gray-100 p-4 rounded">
              <p className="text-center">Container SM - Medium container</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App