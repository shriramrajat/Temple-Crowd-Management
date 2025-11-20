'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageCircle, MapPin, Phone, Mail, Send } from 'lucide-react'

interface Volunteer {
  id: string
  name: string
  zone: string
  status: 'available' | 'busy' | 'break'
  phone: string
  email: string
  position: number[]
  assignedAlerts: number
}

const mockVolunteers: Volunteer[] = [
  {
    id: 'V001',
    name: 'Rajesh Kumar',
    zone: 'Main Prayer Hall',
    status: 'busy',
    phone: '+91-9876543210',
    email: 'rajesh@temple.org',
    position: [35, 45],
    assignedAlerts: 2,
  },
  {
    id: 'V002',
    name: 'Priya Sharma',
    zone: 'East Gate',
    status: 'available',
    phone: '+91-9876543211',
    email: 'priya@temple.org',
    position: [70, 20],
    assignedAlerts: 0,
  },
  {
    id: 'V003',
    name: 'Amit Patel',
    zone: 'West Corridor',
    status: 'available',
    phone: '+91-9876543212',
    email: 'amit@temple.org',
    position: [15, 60],
    assignedAlerts: 1,
  },
  {
    id: 'V004',
    name: 'Deepika Singh',
    zone: 'North Entrance',
    status: 'break',
    phone: '+91-9876543213',
    email: 'deepika@temple.org',
    position: [50, 80],
    assignedAlerts: 0,
  },
  {
    id: 'V005',
    name: 'Vikram Das',
    zone: 'Parking Area',
    status: 'available',
    phone: '+91-9876543214',
    email: 'vikram@temple.org',
    position: [80, 70],
    assignedAlerts: 1,
  },
]

const templeZones = ['Main Prayer Hall', 'East Gate', 'West Corridor', 'North Entrance', 'Parking Area', 'South Wing']

export default function VolunteerManagement() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>(mockVolunteers)
  const [draggedVolunteer, setDraggedVolunteer] = useState<string | null>(null)
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null)
  const [messageText, setMessageText] = useState('')
  const [newZone, setNewZone] = useState('')

  const handleDragStart = (e: React.DragEvent, volunteerId: string) => {
    setDraggedVolunteer(volunteerId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, zone: string) => {
    e.preventDefault()
    if (draggedVolunteer) {
      setVolunteers((prev) =>
        prev.map((v) =>
          v.id === draggedVolunteer ? { ...v, zone } : v
        )
      )
      setDraggedVolunteer(null)
    }
  }

  const handleStatusChange = (volunteerId: string, newStatus: 'available' | 'busy' | 'break') => {
    setVolunteers((prev) =>
      prev.map((v) =>
        v.id === volunteerId ? { ...v, status: newStatus } : v
      )
    )
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log(`Message sent to ${selectedVolunteer?.name}: ${messageText}`)
      setMessageText('')
      // In a real app, this would send via API
    }
  }

  const availableVolunteers = volunteers.filter((v) => v.status === 'available').length
  const busyVolunteers = volunteers.filter((v) => v.status === 'busy').length

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Volunteers</div>
            <div className="text-3xl font-bold text-foreground mt-2">{volunteers.length}</div>
            <div className="text-xs text-primary mt-2">on duty</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Available</div>
            <div className="text-3xl font-bold text-green-500 mt-2">{availableVolunteers}</div>
            <div className="text-xs text-green-500 mt-2">ready to assist</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Busy</div>
            <div className="text-3xl font-bold text-orange-500 mt-2">{busyVolunteers}</div>
            <div className="text-xs text-orange-500 mt-2">assigned</div>
          </CardContent>
        </Card>
        <Card className="bg-card border border-border">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">On Break</div>
            <div className="text-3xl font-bold text-yellow-500 mt-2">
              {volunteers.filter((v) => v.status === 'break').length}
            </div>
            <div className="text-xs text-yellow-500 mt-2">resting</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volunteer List */}
        <div className="lg:col-span-2">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle>Volunteer Directory</CardTitle>
              <CardDescription>Manage volunteer assignments and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-muted/50">
                      <TableHead className="text-foreground">Name</TableHead>
                      <TableHead className="text-foreground">Assigned Zone</TableHead>
                      <TableHead className="text-foreground">Status</TableHead>
                      <TableHead className="text-foreground">Alerts</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteers.map((volunteer) => (
                      <TableRow
                        key={volunteer.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, volunteer.id)}
                        className="border-border hover:bg-muted/50 cursor-move transition-colors"
                      >
                        <TableCell className="font-medium text-foreground">{volunteer.name}</TableCell>
                        <TableCell className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{volunteer.zone}</span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={volunteer.status}
                            onValueChange={(status) =>
                              handleStatusChange(
                                volunteer.id,
                                status as 'available' | 'busy' | 'break'
                              )
                            }
                          >
                            <SelectTrigger className="w-32 bg-input border-border text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="available">Available</SelectItem>
                              <SelectItem value="busy">Busy</SelectItem>
                              <SelectItem value="break">Break</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              volunteer.assignedAlerts > 0
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                            }
                          >
                            {volunteer.assignedAlerts}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedVolunteer(volunteer)}
                                className="text-xs border-primary/50 hover:bg-primary/10"
                              >
                                <MessageCircle className="w-4 h-4 mr-1" />
                                Message
                              </Button>
                            </DialogTrigger>
                            {selectedVolunteer?.id === volunteer.id && (
                              <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle className="text-foreground">Send Message</DialogTitle>
                                  <DialogDescription className="text-muted-foreground">
                                    Send instructions or updates to {volunteer.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-foreground text-sm mb-2 block">Recipient</Label>
                                    <div className="flex items-center gap-3 p-3 bg-input rounded-lg border border-border">
                                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {volunteer.name.charAt(0)}
                                      </div>
                                      <div>
                                        <div className="font-medium text-foreground">{volunteer.name}</div>
                                        <div className="text-xs text-muted-foreground">{volunteer.zone}</div>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Phone className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{volunteer.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Mail className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm text-muted-foreground">{volunteer.email}</span>
                                    </div>
                                  </div>
                                  <div>
                                    <Label htmlFor="message" className="text-foreground text-sm mb-2 block">
                                      Message
                                    </Label>
                                    <textarea
                                      id="message"
                                      value={messageText}
                                      onChange={(e) => setMessageText(e.target.value)}
                                      placeholder="Type your message or instruction..."
                                      className="w-full p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground resize-none"
                                      rows={4}
                                    />
                                  </div>
                                  <Button
                                    onClick={handleSendMessage}
                                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Message
                                  </Button>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Drag-and-Drop Zone Board */}
        <div className="space-y-4">
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Assign Volunteers</CardTitle>
              <CardDescription className="text-xs">Drag volunteers to zones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templeZones.map((zone) => (
                <div
                  key={zone}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, zone)}
                  className="p-3 bg-input border-2 border-dashed border-border/50 rounded-lg hover:border-primary/50 transition-colors min-h-16 flex items-center justify-center"
                >
                  <div className="text-center">
                    <MapPin className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
                    <div className="text-xs font-medium text-foreground">{zone}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {volunteers.filter((v) => v.zone === zone).length} volunteer
                      {volunteers.filter((v) => v.zone === zone).length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Mini Map */}
          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-lg">Zone Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-64 bg-input border border-border/50 rounded-lg overflow-hidden">
                {/* Temple Layout Grid */}
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                  {/* Zone backgrounds */}
                  <rect x="0" y="0" width="50" height="50" fill="rgba(168, 85, 247, 0.1)" stroke="rgba(168, 85, 247, 0.3)" strokeWidth="1" />
                  <rect x="50" y="0" width="50" height="50" fill="rgba(59, 130, 246, 0.1)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1" />
                  <rect x="0" y="50" width="50" height="50" fill="rgba(249, 115, 22, 0.1)" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="1" />
                  <rect x="50" y="50" width="50" height="50" fill="rgba(34, 197, 94, 0.1)" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1" />

                  {/* Volunteer positions */}
                  {volunteers.map((v) => (
                    <g key={v.id}>
                      <circle
                        cx={v.position[0]}
                        cy={v.position[1]}
                        r="3"
                        fill={v.status === 'available' ? '#22c55e' : v.status === 'busy' ? '#f97316' : '#eab308'}
                        opacity="0.8"
                      />
                      <circle
                        cx={v.position[0]}
                        cy={v.position[1]}
                        r="4"
                        fill="none"
                        stroke={v.status === 'available' ? '#22c55e' : v.status === 'busy' ? '#f97316' : '#eab308'}
                        strokeWidth="0.5"
                        opacity="0.5"
                      />
                    </g>
                  ))}
                </svg>

                {/* Legend */}
                <div className="absolute bottom-2 left-2 right-2 flex gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-muted-foreground">Busy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <span className="text-muted-foreground">Break</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
