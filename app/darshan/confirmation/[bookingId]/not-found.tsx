import { FileQuestion, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function BookingNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-6">
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Booking Not Found</CardTitle>
          <CardDescription>
            The booking you're looking for doesn't exist or may have been cancelled.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Please check your booking ID and try again, or search for your bookings using your phone number or email.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/darshan/my-bookings">
              <Search className="h-4 w-4" />
              Find My Bookings
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href="/darshan">
              <Home className="h-4 w-4" />
              Book New Slot
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
