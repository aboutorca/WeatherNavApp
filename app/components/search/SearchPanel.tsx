'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Location } from '@/lib/types';
import AddressInput from './AddressInput';
import { Calendar, MapPin, Navigation } from 'lucide-react';
import { format } from 'date-fns';

const formSchema = z.object({
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  departureTime: z.string().optional()
});

interface SearchPanelProps {
  onSearch: (origin: Location, destination: Location, departureTime?: Date) => void;
  isLoading?: boolean;
}

export default function SearchPanel({ onSearch, isLoading }: SearchPanelProps) {
  const [originLocation, setOriginLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: '',
      destination: '',
      departureTime: ''
    }
  });

  const handleSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (originLocation && destinationLocation) {
        const departureTime = values.departureTime
          ? new Date(values.departureTime)
          : undefined;
        onSearch(originLocation, destinationLocation, departureTime);
      }
    },
    [originLocation, destinationLocation, onSearch]
  );

  const handleOriginSelect = useCallback((location: Location, address: string) => {
    setOriginLocation(location);
    form.setValue('origin', address);
  }, [form]);

  const handleDestinationSelect = useCallback((location: Location, address: string) => {
    setDestinationLocation(location);
    form.setValue('destination', address);
  }, [form]);

  const swapLocations = useCallback(() => {
    const tempOrigin = form.getValues('origin');
    const tempDest = form.getValues('destination');
    const tempOriginLoc = originLocation;
    const tempDestLoc = destinationLocation;

    form.setValue('origin', tempDest);
    form.setValue('destination', tempOrigin);
    setOriginLocation(tempDestLoc);
    setDestinationLocation(tempOriginLoc);
  }, [form, originLocation, destinationLocation]);

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  return (
    <Card className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Origin
                </FormLabel>
                <FormControl>
                  <AddressInput
                    value={field.value}
                    onChange={field.onChange}
                    onLocationSelect={handleOriginSelect}
                    placeholder="Enter starting point..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={swapLocations}
              className="rounded-full"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </Button>
          </div>

          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  Destination
                </FormLabel>
                <FormControl>
                  <AddressInput
                    value={field.value}
                    onChange={field.onChange}
                    onLocationSelect={handleDestinationSelect}
                    placeholder="Enter destination..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="departureTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Departure Time (Optional)
                </FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    min={getCurrentDateTime()}
                    max={(() => {
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 5);
                      maxDate.setMinutes(maxDate.getMinutes() - maxDate.getTimezoneOffset());
                      return maxDate.toISOString().slice(0, 16);
                    })()}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !originLocation || !destinationLocation}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Calculating Route...
              </>
            ) : (
              'Get Directions'
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}