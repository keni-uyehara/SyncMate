"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain } from "lucide-react"

export default function AIEvaluationTabSimple() {
  const [testData, setTestData] = useState("Component loaded successfully!")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Evaluation Tab - Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">{testData}</p>
          <Button 
            onClick={() => setTestData("Button clicked! Component is working.")}
            variant="outline"
          >
            Test Button
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
